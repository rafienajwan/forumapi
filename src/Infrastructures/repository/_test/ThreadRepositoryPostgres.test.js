const pg = require("pg");
pg.types.setTypeParser(1114, (str) => str); // TIMESTAMP WITHOUT TIME ZONE

const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("constructor", () => {
    it("should use default nanoid when idGenerator is not provided", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });

      const newThread = new NewThread({
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
      });

      // Act - Create repository without passing idGenerator (uses default nanoid)
      const threadRepository = new ThreadRepositoryPostgres(pool);
      const addedThread = await threadRepository.addThread(newThread);

      // Assert
      expect(addedThread.id).toMatch(/^thread-/); // Should start with "thread-"
      expect(addedThread.id.length).toBeGreaterThan(7); // "thread-" + nanoid should be longer
      expect(addedThread.title).toEqual(newThread.title);
      expect(addedThread.owner).toEqual(newThread.owner);
    });
  });

  describe("addThread function", () => {
    it("should persist new thread and return added thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });

      const newThread = new NewThread({
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Act
      const addedThread = await threadRepository.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual({
        id: "thread-123",
        title: newThread.title,
        owner: newThread.owner,
      });
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError if thread not found", async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act & Assert
      await expect(
        threadRepository.getThreadById("thread-xxx"),
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return thread detail correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const threadDate = new Date(Date.UTC(2023, 0, 1, 0, 0, 0));
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
        date: threadDate,
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act
      const thread = await threadRepository.getThreadById("thread-123");

      // Assert
      expect(thread.id).toEqual("thread-123");
      expect(thread.title).toEqual("Thread title");
      expect(thread.body).toEqual("Thread body");
      expect(new Date(thread.date).toISOString()).toEqual(
        threadDate.toISOString(),
      );
      expect(thread.username).toEqual("dicoding");
    });
  });

  describe("verifyAvailableThread function", () => {
    it("should not throw NotFoundError if thread exists", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act & Assert
      await expect(
        threadRepository.verifyAvailableThread("thread-123"),
      ).resolves.not.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if thread does not exist", async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act & Assert
      await expect(
        threadRepository.verifyAvailableThread("thread-xxx"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return comments for a thread, including deleted ones", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
      });
      const commentDate1 = new Date(Date.UTC(2023, 0, 1, 0, 0, 0));
      const commentDate2 = new Date(Date.UTC(2023, 0, 1, 1, 0, 0));
      await CommentsTableTestHelper.addComment({
        id: "comment-1",
        thread_id: "thread-123",
        content: "A comment",
        date: commentDate1,
        owner: "user-123",
        is_delete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-2",
        thread_id: "thread-123",
        content: "Deleted comment",
        date: commentDate2,
        owner: "user-123",
        is_delete: true,
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act
      const comments =
        await threadRepository.getCommentsByThreadId("thread-123");

      // Assert
      expect(comments).toHaveLength(2);

      expect(comments[0]).toMatchObject({
        id: "comment-1",
        username: "dicoding",
        content: "A comment",
        is_delete: false,
      });
      expect(new Date(comments[0].date).toISOString()).toEqual(
        commentDate1.toISOString(),
      );

      expect(comments[1]).toMatchObject({
        id: "comment-2",
        username: "dicoding",
        content: "Deleted comment",
        is_delete: true,
      });
      expect(new Date(comments[1].date).toISOString()).toEqual(
        commentDate2.toISOString(),
      );
    });

    it("should return empty array when thread has no comments", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      // Act
      const comments =
        await threadRepository.getCommentsByThreadId("thread-123");

      // Assert
      expect(comments).toHaveLength(0);
      expect(comments).toEqual([]);
    });
  });
});

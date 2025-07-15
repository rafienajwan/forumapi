const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NewComment = require("../../../Domains/comments/entities/NewComment");

// Helper functions for setup/teardown
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("CommentRepositoryPostgres", () => {
  beforeAll(async () => {
    // Insert a user and a thread for foreign key constraints
    await UsersTableTestHelper.addUser({ id: "user-1", username: "dicoding" });
    await ThreadsTableTestHelper.addThread({
      id: "thread-1",
      title: "thread title",
      body: "thread body",
      owner: "user-1",
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("constructor", () => {
    it("should use default nanoid when idGenerator is not provided", async () => {
      // Arrange
      const repo = new CommentRepositoryPostgres(pool); // No idGenerator passed
      const newComment = new NewComment({ content: "test comment" });

      // Act
      const result = await repo.addComment(newComment, "thread-1", "user-1");

      // Assert
      expect(result.id).toMatch(/^comment-/); // Should start with "comment-"
      expect(result.id.length).toBeGreaterThan(8); // "comment-" + nanoid should be longer
      expect(result.content).toBe("test comment");
      expect(result.owner).toBe("user-1");
    });
  });

  describe("addComment function", () => {
    it("should persist new comment and return correct data", async () => {
      const repo = new CommentRepositoryPostgres(pool, () => "123");
      const newComment = new NewComment({ content: "test comment" });
      const result = await repo.addComment(newComment, "thread-1", "user-1");
      expect(result).toEqual({
        id: "comment-123",
        content: "test comment",
        owner: "user-1",
      });

      // Check DB
      const comments =
        await CommentsTableTestHelper.findCommentById("comment-123");
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe("test comment");
      expect(comments[0].owner).toBe("user-1");
      expect(comments[0].is_delete).toBe(false);
    });
  });

  describe("deleteComment function", () => {
    it("should soft delete comment", async () => {
      // Arrange: add a comment first
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "to be deleted",
        thread_id: "thread-1",
        owner: "user-1",
        is_delete: false,
      });

      const repo = new CommentRepositoryPostgres(pool, () => "123");
      await repo.deleteComment("comment-123");

      // Check DB for is_delete = true
      const comments =
        await CommentsTableTestHelper.findCommentById("comment-123");
      expect(comments[0].is_delete).toBe(true);
    });

    it("should throw error when deleting non-existent comment", async () => {
      const repo = new CommentRepositoryPostgres(pool, () => "123");
      await expect(repo.deleteComment("comment-not-exist")).rejects.toThrow(
        "COMMENT_REPOSITORY.COMMENT_NOT_FOUND",
      );
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should verify comment owner correctly", async () => {
      // Arrange: add a comment
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "test",
        thread_id: "thread-1",
        owner: "user-1",
        is_delete: false,
      });

      const repo = new CommentRepositoryPostgres(pool, () => "123");

      // Should not throw any error when owner is correct
      await expect(
        repo.verifyCommentOwner("comment-123", "user-1"),
      ).resolves.not.toThrow("COMMENT_REPOSITORY.NOT_THE_OWNER");

      // Should throw error when owner is different
      await expect(
        repo.verifyCommentOwner("comment-123", "user-2"),
      ).rejects.toThrow("COMMENT_REPOSITORY.NOT_THE_OWNER");
    });

    it("should throw error when verifying owner of non-existent comment", async () => {
      const repo = new CommentRepositoryPostgres(pool, () => "123");
      await expect(
        repo.verifyCommentOwner("comment-not-exist", "user-1"),
      ).rejects.toThrow("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should get comments by thread id", async () => {
      // Arrange: add two comments
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "first comment",
        thread_id: "thread-1",
        owner: "user-1",
        is_delete: false,
        date: new Date("2023-01-01T00:00:00Z"),
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-124",
        content: "second comment",
        thread_id: "thread-1",
        owner: "user-1",
        is_delete: true,
        date: new Date("2023-01-02T00:00:00Z"),
      });

      const repo = new CommentRepositoryPostgres(pool, () => "123");
      const comments = await repo.getCommentsByThreadId("thread-1");

      expect(comments).toHaveLength(2);

      expect(comments[0]).toMatchObject({
        id: "comment-123",
        owner: "user-1",
        content: "first comment",
        is_delete: false,
      });
      expect(new Date(comments[0].date).toISOString()).toBe(
        "2023-01-01T00:00:00.000Z",
      );

      expect(comments[1]).toMatchObject({
        id: "comment-124",
        owner: "user-1",
        content: "second comment",
        is_delete: true,
      });
      expect(new Date(comments[1].date).toISOString()).toBe(
        "2023-01-02T00:00:00.000Z",
      );
    });
  });
});

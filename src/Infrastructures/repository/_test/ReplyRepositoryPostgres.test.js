const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NewReply = require("../../../Domains/replies/entities/NewReply");

// Helper functions for setup/teardown
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("ReplyRepositoryPostgres", () => {
  beforeAll(async () => {
    // Insert a user, thread, and comment for foreign key constraints
    await UsersTableTestHelper.addUser({ id: "user-1", username: "dicoding" });
    await ThreadsTableTestHelper.addThread({
      id: "thread-1",
      title: "thread title",
      body: "thread body",
      owner: "user-1",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-1",
      thread_id: "thread-1",
      content: "comment content",
      owner: "user-1",
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("constructor", () => {
    it("should use default nanoid when idGenerator is not provided", async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool); // No idGenerator passed
      const newReply = new NewReply({ content: "test reply" });

      // Act
      const result = await repo.addReply(newReply, "comment-1", "user-1");

      // Assert
      expect(result.id).toMatch(/^reply-/); // Should start with "reply-"
      expect(result.id.length).toBeGreaterThan(6); // "reply-" + nanoid should be longer
      expect(result.content).toBe("test reply");
      expect(result.owner).toBe("user-1");
    });
  });

  describe("addReply function", () => {
    it("should persist new reply and return correct data", async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool, () => "123");
      const newReply = new NewReply({ content: "test reply" });

      // Act
      const result = await repo.addReply(newReply, "comment-1", "user-1");

      // Assert
      expect(result).toEqual({
        id: "reply-123",
        content: "test reply",
        owner: "user-1",
      });

      // Check DB
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe("test reply");
      expect(replies[0].owner).toBe("user-1");
      expect(replies[0].is_delete).toBe(false);
    });
  });

  describe("deleteReply function", () => {
    it("should soft delete reply", async () => {
      // Arrange: add a reply first
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "to be deleted",
        commentId: "comment-1",
        owner: "user-1",
        isDelete: false,
      });

      const repo = new ReplyRepositoryPostgres(pool, () => "123");
      await repo.deleteReply("reply-123");

      // Check DB for is_delete = true
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies[0].is_delete).toBe(true);
    });

    it("should throw error when deleting non-existent reply", async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => "123");
      await expect(repo.deleteReply("reply-not-exist")).rejects.toThrow(
        "REPLY_REPOSITORY.REPLY_NOT_FOUND"
      );
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should verify reply owner correctly", async () => {
      // Arrange: add a reply
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "test",
        commentId: "comment-1",
        owner: "user-1",
        isDelete: false,
      });

      const repo = new ReplyRepositoryPostgres(pool, () => "123");

      // Should not throw any error when owner is correct
      await expect(
        repo.verifyReplyOwner("reply-123", "user-1")
      ).resolves.not.toThrow("REPLY_REPOSITORY.NOT_THE_OWNER");

      // Should throw error when owner is different
      await expect(
        repo.verifyReplyOwner("reply-123", "user-2")
      ).rejects.toThrow("REPLY_REPOSITORY.NOT_THE_OWNER");
    });

    it("should throw error when verifying owner of non-existent reply", async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => "123");
      await expect(
        repo.verifyReplyOwner("reply-not-exist", "user-1")
      ).rejects.toThrow("REPLY_REPOSITORY.REPLY_NOT_FOUND");
    });
  });

  describe("verifyReplyExists function", () => {
    it("should not throw error when reply exists", async () => {
      // Arrange: add a reply
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "test",
        commentId: "comment-1",
        owner: "user-1",
      });

      const repo = new ReplyRepositoryPostgres(pool, () => "123");

      // Act & Assert
      await expect(repo.verifyReplyExists("reply-123")).resolves.not.toThrow();
    });

    it("should throw error when reply does not exist", async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => "123");
      await expect(repo.verifyReplyExists("reply-not-exist")).rejects.toThrow(
        "REPLY_REPOSITORY.REPLY_NOT_FOUND"
      );
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies for a comment, including deleted ones", async () => {
      // Arrange
      const replyDate1 = new Date(Date.UTC(2023, 0, 1, 0, 0, 0));
      const replyDate2 = new Date(Date.UTC(2023, 0, 1, 1, 0, 0));

      await RepliesTableTestHelper.addReply({
        id: "reply-1",
        commentId: "comment-1",
        content: "A reply",
        date: replyDate1.toISOString(),
        owner: "user-1",
        isDelete: false,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-2",
        commentId: "comment-1",
        content: "Deleted reply",
        date: replyDate2.toISOString(),
        owner: "user-1",
        isDelete: true,
      });

      const repo = new ReplyRepositoryPostgres(pool, () => "123");

      // Act
      const replies = await repo.getRepliesByCommentId("comment-1");

      // Assert
      expect(replies).toHaveLength(2);

      expect(replies[0]).toMatchObject({
        id: "reply-1",
        username: "dicoding",
        content: "A reply",
        is_delete: false,
      });
      expect(new Date(replies[0].date).toISOString()).toEqual(
        replyDate1.toISOString()
      );

      expect(replies[1]).toMatchObject({
        id: "reply-2",
        username: "dicoding",
        content: "Deleted reply",
        is_delete: true,
      });
      expect(new Date(replies[1].date).toISOString()).toEqual(
        replyDate2.toISOString()
      );
    });

    it("should return empty array when comment has no replies", async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => "123");

      // Act
      const replies = await repo.getRepliesByCommentId("comment-1");

      // Assert
      expect(replies).toHaveLength(0);
      expect(replies).toEqual([]);
    });
  });
});

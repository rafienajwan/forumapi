const pool = require("../../database/postgres/pool");
const CommentLikeRepositoryPostgres = require("../CommentLikeRepositoryPostgres");

// Helper functions for setup/teardown
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");

describe("CommentLikeRepositoryPostgres", () => {
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
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("constructor", () => {
    it("should use default nanoid when idGenerator is not provided", async () => {
      // Arrange
      const repo = new CommentLikeRepositoryPostgres(pool); // No idGenerator passed

      // Act
      const result = await repo.addLike("comment-1", "user-1");

      // Assert
      expect(result.id).toMatch(/^like-/); // Should start with "like-"
      expect(result.id.length).toBeGreaterThan(5); // "like-" + nanoid should be longer
    });
  });

  describe("addLike function", () => {
    it("should persist new like and return correct data", async () => {
      // Arrange
      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      const result = await repo.addLike("comment-1", "user-1");

      // Assert
      expect(result).toEqual({
        id: "like-123",
      });

      // Check DB
      const likes = await CommentLikesTableTestHelper.findLikeById("like-123");
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toBe("comment-1");
      expect(likes[0].owner).toBe("user-1");
    });
  });

  describe("removeLike function", () => {
    it("should remove like correctly", async () => {
      // Arrange: add a like first
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-1",
        owner: "user-1",
      });

      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      await repo.removeLike("comment-1", "user-1");

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeById("like-123");
      expect(likes).toHaveLength(0);
    });

    it("should throw error when removing non-existent like", async () => {
      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");
      await expect(repo.removeLike("comment-1", "user-1")).rejects.toThrow(
        "COMMENT_LIKE_REPOSITORY.LIKE_NOT_FOUND",
      );
    });
  });

  describe("verifyLikeExistence function", () => {
    it("should return true if like exists", async () => {
      // Arrange: add a like first
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-1",
        owner: "user-1",
      });

      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      const exists = await repo.verifyLikeExistence("comment-1", "user-1");

      // Assert
      expect(exists).toBe(true);
    });

    it("should return false if like does not exist", async () => {
      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      const exists = await repo.verifyLikeExistence("comment-1", "user-1");

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe("getLikeCountByCommentId function", () => {
    it("should return correct like count", async () => {
      // Arrange: add multiple likes
      await UsersTableTestHelper.addUser({ id: "user-2", username: "johndoe" });
      await CommentLikesTableTestHelper.addLike({
        id: "like-1",
        commentId: "comment-1",
        owner: "user-1",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-2",
        commentId: "comment-1",
        owner: "user-2",
      });

      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      const count = await repo.getLikeCountByCommentId("comment-1");

      // Assert
      expect(count).toBe(2);
    });

    it("should return 0 if no likes exist", async () => {
      const repo = new CommentLikeRepositoryPostgres(pool, () => "123");

      // Act
      const count = await repo.getLikeCountByCommentId("comment-1");

      // Assert
      expect(count).toBe(0);
    });
  });
});

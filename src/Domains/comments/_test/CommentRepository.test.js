const CommentRepository = require("../CommentRepository");

describe("CommentRepository interface", () => {
  it("should throw error when invoke unimplemented methods", async () => {
    const repo = new CommentRepository();
    await expect(
      repo.addComment({}, "thread-1", "user-1"),
    ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(repo.deleteComment("comment-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(
      repo.verifyCommentOwner("comment-1", "user-1"),
    ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(repo.getCommentsByThreadId("thread-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(repo.verifyCommentExists("comment-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(repo.likeComment("comment-1", "user-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(repo.unlikeComment("comment-1", "user-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(repo.verifyCommentLike("comment-1", "user-1")).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });
});

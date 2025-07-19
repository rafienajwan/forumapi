const CommentLikeRepository = require("../CommentLikeRepository");

describe("CommentLikeRepository interface", () => {
  it("should throw error when invoke unimplemented methods", async () => {
    const repo = new CommentLikeRepository();
    
    await expect(
      repo.addLike("comment-1", "user-1"),
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    
    await expect(
      repo.removeLike("comment-1", "user-1"),
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    
    await expect(
      repo.verifyLikeExistence("comment-1", "user-1"),
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    
    await expect(
      repo.getLikeCountByCommentId("comment-1"),
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});

class CommentLikeRepository {
  async addLike(commentId, owner) {
    throw new Error("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async removeLike(commentId, owner) {
    throw new Error("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyLikeExistence(commentId, owner) {
    throw new Error("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getLikeCountByCommentId(commentId) {
    throw new Error("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = CommentLikeRepository;

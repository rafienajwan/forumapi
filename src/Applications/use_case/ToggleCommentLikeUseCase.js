class ToggleCommentLikeUseCase {
  constructor({ commentRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId, commentId, owner) {
    // Verify comment exists and belongs to the thread
    await this._commentRepository.verifyCommentExists(commentId);
    
    // Check if user already liked this comment
    const isLiked = await this._commentLikeRepository.verifyLikeExistence(commentId, owner);
    
    if (isLiked) {
      // Unlike the comment
      await this._commentLikeRepository.removeLike(commentId, owner);
    } else {
      // Like the comment
      await this._commentLikeRepository.addLike(commentId, owner);
    }
  }
}

module.exports = ToggleCommentLikeUseCase;

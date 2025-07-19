class LikeCommentUseCase {
  constructor({ commentRepository, threadRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isLiked = await this._commentLikeRepository.verifyLikeExistence(commentId, owner);
    
    if (isLiked) {
      // If like exists, unlike the comment
      await this._commentLikeRepository.removeLike(commentId, owner);
    } else {
      // If like doesn't exist, like the comment
      await this._commentLikeRepository.addLike(commentId, owner);
    }
  }
}

module.exports = LikeCommentUseCase;

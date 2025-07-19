const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, commentId, threadId, owner) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    return this._replyRepository.addReply(newReply, commentId, owner);
  }
}

module.exports = AddReplyUseCase;

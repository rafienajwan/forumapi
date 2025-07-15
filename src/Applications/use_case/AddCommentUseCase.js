const NewComment = require("../../Domains/comments/entities/NewComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload, threadId, owner) {
    // Ensure the thread exists before adding a comment
    await this._threadRepository.verifyAvailableThread(threadId);

    const newComment = new NewComment(payload);
    return this._commentRepository.addComment(newComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;

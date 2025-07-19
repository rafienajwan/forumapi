class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    // Get thread detail (throws NotFoundError if not found)
    const thread = await this._threadRepository.getThreadById(threadId);

    // Get all comments for the thread
    const comments =
      await this._threadRepository.getCommentsByThreadId(threadId);

    // Format comments as required
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete
        ? "**komentar telah dihapus**"
        : comment.content,
    }));

    // Return thread detail with comments
    return {
      ...thread,
      comments: formattedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;

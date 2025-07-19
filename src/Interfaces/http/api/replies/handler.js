class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance('AddReplyUseCase');
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addedReply = await addReplyUseCase.execute(
      request.payload,
      commentId,
      threadId,
      owner
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance('DeleteReplyUseCase');
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    await deleteReplyUseCase.execute(threadId, commentId, replyId, owner);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;

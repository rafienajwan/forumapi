class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.likeCommentHandler = this.likeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance("AddCommentUseCase");
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await addCommentUseCase.execute(
      request.payload,
      threadId,
      owner,
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      "DeleteCommentUseCase",
    );
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await deleteCommentUseCase.execute(threadId, commentId, owner);

    return {
      status: "success",
    };
  }

  async likeCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance("LikeCommentUseCase");
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await likeCommentUseCase.execute(threadId, commentId, owner);

    return {
      status: "success",
    };
  }
}

module.exports = CommentsHandler;

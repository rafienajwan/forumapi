class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this); // <-- ADD THIS
  }

  async postThreadHandler(request, h) {
    try {
      const addThreadUseCase = this._container.getInstance("AddThreadUseCase");
      const { id: owner } = request.auth.credentials;
      const { title, body } = request.payload;

      const addedThread = await addThreadUseCase.execute({
        title,
        body,
        owner,
      });

      const response = h.response({
        status: "success",
        data: {
          addedThread,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      // Log the error for debugging
      console.error("THREAD HANDLER ERROR:", error);
      throw error;
    }
  }

  async getThreadByIdHandler(request, h) {
    try {
      const getThreadDetailUseCase = this._container.getInstance(
        "GetThreadDetailUseCase",
      );
      const { threadId } = request.params;
      const thread = await getThreadDetailUseCase.execute(threadId);

      return {
        status: "success",
        data: {
          thread,
        },
      };
    } catch (error) {
      // Optional: log for debugging
      // console.error('GET THREAD HANDLER ERROR:', error);
      throw error;
    }
  }
}

module.exports = ThreadsHandler;

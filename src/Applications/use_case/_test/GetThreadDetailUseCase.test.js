const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrate getting thread detail with comments correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThread = {
      id: threadId,
      title: "Thread title",
      body: "Thread body",
      date: new Date("2023-01-01T00:00:00.000Z"),
      username: "dicoding",
    };
    const mockComments = [
      {
        id: "comment-1",
        username: "johndoe",
        date: new Date("2023-01-01T01:00:00.000Z"),
        content: "A comment",
        is_delete: false,
      },
      {
        id: "comment-2",
        username: "janedoe",
        date: new Date("2023-01-01T02:00:00.000Z"),
        content: "Deleted comment",
        is_delete: true,
      },
    ];

    const mockThreadRepository = {
      getThreadById: jest.fn(() => Promise.resolve(mockThread)),
      getCommentsByThreadId: jest.fn(() => Promise.resolve(mockComments)),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await useCase.execute(threadId);

    // Assert
    expect(result).toEqual({
      ...mockThread,
      comments: [
        {
          id: "comment-1",
          username: "johndoe",
          date: new Date("2023-01-01T01:00:00.000Z"),
          content: "A comment",
        },
        {
          id: "comment-2",
          username: "janedoe",
          date: new Date("2023-01-01T02:00:00.000Z"),
          content: "**komentar telah dihapus**",
        },
      ],
    });
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );
  });

  it("should throw NotFoundError if thread not found", async () => {
    // Arrange
    const threadId = "thread-xxx";
    const mockThreadRepository = {
      getThreadById: jest.fn(() =>
        Promise.reject(new NotFoundError("thread tidak ditemukan")),
      ),
      getCommentsByThreadId: jest.fn(),
    };
    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(useCase.execute(threadId)).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
  });
});

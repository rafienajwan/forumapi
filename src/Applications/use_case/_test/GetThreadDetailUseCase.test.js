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
        like_count: 0,
      },
      {
        id: "comment-2",
        username: "janedoe",
        date: new Date("2023-01-01T02:00:00.000Z"),
        content: "Deleted comment",
        is_delete: true,
        like_count: 0,
      },
    ];

    const mockReplies = [
      {
        id: "reply-1",
        username: "replier",
        date: new Date("2023-01-01T03:00:00.000Z"),
        content: "A reply",
        is_delete: false,
      },
    ];

    const mockThreadRepository = {
      getThreadById: jest.fn(() => Promise.resolve(mockThread)),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(() => Promise.resolve(mockComments)),
    };

    const mockReplyRepository = {
      getRepliesByCommentId: jest.fn(() => Promise.resolve(mockReplies)),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
          likeCount: 0,
          replies: [
            {
              id: "reply-1",
              username: "replier",
              date: new Date("2023-01-01T03:00:00.000Z"),
              content: "A reply",
            },
          ],
        },
        {
          id: "comment-2",
          username: "janedoe",
          date: new Date("2023-01-01T02:00:00.000Z"),
          content: "**komentar telah dihapus**",
          likeCount: 0,
          replies: [
            {
              id: "reply-1",
              username: "replier",
              date: new Date("2023-01-01T03:00:00.000Z"),
              content: "A reply",
            },
          ],
        },
      ],
    });
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith("comment-1");
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith("comment-2");
  });

  it("should throw NotFoundError if thread not found", async () => {
    // Arrange
    const threadId = "thread-xxx";
    const mockThreadRepository = {
      getThreadById: jest.fn(() =>
        Promise.reject(new NotFoundError("thread tidak ditemukan")),
      ),
    };
    
    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(),
    };

    const mockReplyRepository = {
      getRepliesByCommentId: jest.fn(),
    };
    
    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(useCase.execute(threadId)).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
  });
});

const LikeCommentUseCase = require("../LikeCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentLikeRepository = require("../../../Domains/comments/CommentLikeRepository");

describe("LikeCommentUseCase", () => {
  it("should orchestrate the like comment action correctly when comment is not liked", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExistence = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute("thread-123", "comment-123", "user-123");

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
    expect(mockCommentLikeRepository.verifyLikeExistence).toBeCalledWith("comment-123", "user-123");
    expect(mockCommentLikeRepository.addLike).toBeCalledWith("comment-123", "user-123");
  });

  it("should orchestrate the unlike comment action correctly when comment is already liked", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExistence = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute("thread-123", "comment-123", "user-123");

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
    expect(mockCommentLikeRepository.verifyLikeExistence).toBeCalledWith("comment-123", "user-123");
    expect(mockCommentLikeRepository.removeLike).toBeCalledWith("comment-123", "user-123");
  });

  it("should throw error when thread not found", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.reject(new Error("THREAD_REPOSITORY.THREAD_NOT_FOUND")));

    // Create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute("thread-123", "comment-123", "user-123"))
      .rejects.toThrowError("THREAD_REPOSITORY.THREAD_NOT_FOUND");
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
  });

  it("should throw error when comment not found", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.reject(new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND")));

    // Create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute("thread-123", "comment-123", "user-123"))
      .rejects.toThrowError("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
  });
});

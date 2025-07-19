const ToggleCommentLikeUseCase = require("../ToggleCommentLikeUseCase");

describe("ToggleCommentLikeUseCase", () => {
  it("should orchestrate like comment action correctly when comment is not liked", async () => {
    // Arrange
    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };
    const mockCommentLikeRepository = {
      verifyLikeExistence: jest.fn().mockResolvedValue(false),
      addLike: jest.fn().mockResolvedValue(),
      removeLike: jest.fn(),
    };
    
    const useCase = new ToggleCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Act
    await useCase.execute("thread-1", "comment-1", "user-1");

    // Assert
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-1");
    expect(mockCommentLikeRepository.verifyLikeExistence).toBeCalledWith("comment-1", "user-1");
    expect(mockCommentLikeRepository.addLike).toBeCalledWith("comment-1", "user-1");
    expect(mockCommentLikeRepository.removeLike).not.toBeCalled();
  });

  it("should orchestrate unlike comment action correctly when comment is already liked", async () => {
    // Arrange
    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };
    const mockCommentLikeRepository = {
      verifyLikeExistence: jest.fn().mockResolvedValue(true),
      addLike: jest.fn(),
      removeLike: jest.fn().mockResolvedValue(),
    };
    
    const useCase = new ToggleCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Act
    await useCase.execute("thread-1", "comment-1", "user-1");

    // Assert
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-1");
    expect(mockCommentLikeRepository.verifyLikeExistence).toBeCalledWith("comment-1", "user-1");
    expect(mockCommentLikeRepository.removeLike).toBeCalledWith("comment-1", "user-1");
    expect(mockCommentLikeRepository.addLike).not.toBeCalled();
  });

  it("should throw error if comment does not exist", async () => {
    // Arrange
    const mockCommentRepository = {
      verifyCommentExists: jest.fn(() =>
        Promise.reject(new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND"))
      ),
    };
    const mockCommentLikeRepository = {
      verifyLikeExistence: jest.fn(),
      addLike: jest.fn(),
      removeLike: jest.fn(),
    };
    
    const useCase = new ToggleCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Act & Assert
    await expect(
      useCase.execute("thread-1", "comment-1", "user-1")
    ).rejects.toThrow("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-1");
    expect(mockCommentLikeRepository.verifyLikeExistence).not.toBeCalled();
  });
});

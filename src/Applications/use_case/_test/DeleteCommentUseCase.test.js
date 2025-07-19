const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the delete comment action correctly", async () => {
    // Arrange
    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };
    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act
    await useCase.execute("thread-1", "comment-1", "user-1");

    // Assert
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      "comment-1",
      "user-1",
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith("comment-1");
  });

  it("should throw error if not the owner", async () => {
    // Arrange
    const mockCommentRepository = {
      verifyCommentOwner: jest
        .fn()
        .mockRejectedValue(new Error("COMMENT_REPOSITORY.NOT_THE_OWNER")),
      deleteComment: jest.fn(),
    };
    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act & Assert
    await expect(
      useCase.execute("thread-1", "comment-1", "user-2"),
    ).rejects.toThrow("COMMENT_REPOSITORY.NOT_THE_OWNER");
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      "comment-1",
      "user-2",
    );
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });
});

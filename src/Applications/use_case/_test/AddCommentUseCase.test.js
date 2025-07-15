const AddCommentUseCase = require("../AddCommentUseCase");
const NewComment = require("../../../Domains/comments/entities/NewComment");

describe("AddCommentUseCase", () => {
  it("should orchestrate add comment correctly", async () => {
    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue({
        id: "comment-123",
        content: "abc",
        owner: "user-1",
      }),
    };
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(), // <-- Add this mock!
    };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository, // <-- Pass it here!
    });

    const payload = { content: "abc" };
    const result = await useCase.execute(payload, "thread-1", "user-1");

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      "thread-1",
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      expect.any(NewComment),
      "thread-1",
      "user-1",
    );
    expect(result).toEqual({
      id: "comment-123",
      content: "abc",
      owner: "user-1",
    });
  });
});

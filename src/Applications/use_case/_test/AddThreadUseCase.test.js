const AddThreadUseCase = require("../AddThreadUseCase");
const NewThread = require("../../../Domains/threads/entities/NewThread");

describe("AddThreadUseCase", () => {
  it("should orchestrate add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Thread title",
      body: "Thread body",
      owner: "user-123",
    };

    // Simulate what the repository would return
    const mockAddedThreadFromRepo = {
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    // Mock repository
    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(mockAddedThreadFromRepo),
    };

    // Create use case instance
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.any(NewThread),
    );
    expect(addedThread).toStrictEqual({
      id: "thread-123",
      title: "Thread title",
      owner: "user-123",
    });
  });
});

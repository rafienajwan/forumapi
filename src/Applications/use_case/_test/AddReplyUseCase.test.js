const AddReplyUseCase = require("../AddReplyUseCase");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

// Create mocks
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("AddReplyUseCase", () => {
  let addReplyUseCase;
  let mockCommentRepository;
  let mockThreadRepository;
  let mockReplyRepository;

  beforeEach(() => {
    // Mock repositories
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();
    mockReplyRepository = new ReplyRepository();

    // Create use case instance
    addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });
  });

  describe("execute function", () => {
    it("should orchestrate the add reply correctly", async () => {
      // Arrange
      const useCasePayload = {
        content: "sebuah balasan",
      };
      const expectedAddedReply = new AddedReply({
        id: "reply-123",
        content: useCasePayload.content,
        owner: "user-123",
      });

      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
      mockReplyRepository.addReply = jest.fn().mockResolvedValue(expectedAddedReply);

      // Act
      const addedReply = await addReplyUseCase.execute(
        useCasePayload,
        "comment-123",
        "thread-123",
        "user-123"
      );

      // Assert
      expect(addedReply).toStrictEqual(expectedAddedReply);
      expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
      expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
      expect(mockReplyRepository.addReply).toBeCalledWith(
        new NewReply(useCasePayload),
        "comment-123",
        "user-123"
      );
    });

    it("should throw error if payload is not valid", async () => {
      // Arrange
      const useCasePayload = {};

      // Act & Assert
      await expect(
        addReplyUseCase.execute(useCasePayload, "comment-123", "thread-123", "user-123")
      ).rejects.toThrowError("NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    });
  });
});

const DeleteReplyUseCase = require("../DeleteReplyUseCase");

// Create mocks
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("DeleteReplyUseCase", () => {
  let deleteReplyUseCase;
  let mockCommentRepository;
  let mockThreadRepository;
  let mockReplyRepository;

  beforeEach(() => {
    // Mock repositories
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();
    mockReplyRepository = new ReplyRepository();

    // Create use case instance
    deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });
  });

  describe("execute function", () => {
    it("should orchestrate the delete reply correctly", async () => {
      // Arrange
      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
      mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
      mockReplyRepository.deleteReply = jest.fn().mockResolvedValue();

      // Act
      await deleteReplyUseCase.execute("thread-123", "comment-123", "reply-123", "user-123");

      // Assert
      expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
      expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
      expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith("reply-123", "user-123");
      expect(mockReplyRepository.deleteReply).toBeCalledWith("reply-123");
    });
  });
});

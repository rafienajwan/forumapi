const CommentsHandler = require('../handler');

describe('CommentsHandler', () => {
  describe('constructor', () => {
    it('should create handler instance correctly', () => {
      // Arrange
      const mockContainer = {};

      // Action
      const handler = new CommentsHandler(mockContainer);

      // Assert
      expect(handler._container).toBe(mockContainer);
      expect(typeof handler.postCommentHandler).toBe('function');
      expect(typeof handler.deleteCommentHandler).toBe('function');
    });
  });

  describe('postCommentHandler', () => {
    it('should return 201 and added comment data', async () => {
      // Arrange
      const mockAddCommentUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'comment-123',
          content: 'sebuah comment',
          owner: 'user-123',
        }),
      };
      const mockContainer = {
        getInstance: jest.fn().mockReturnValue(mockAddCommentUseCase),
      };

      const request = {
        auth: {
          credentials: { id: 'user-123' },
        },
        params: { threadId: 'thread-123' },
        payload: { content: 'sebuah comment' },
      };

      const h = {
        response: jest.fn().mockReturnValue({
          code: jest.fn(),
        }),
      };

      const handler = new CommentsHandler(mockContainer);

      // Action
      const response = await handler.postCommentHandler(request, h);

      // Assert
      expect(mockContainer.getInstance).toBeCalledWith('AddCommentUseCase');
      expect(mockAddCommentUseCase.execute).toBeCalledWith(
        request.payload,
        'thread-123',
        'user-123'
      );
      expect(h.response).toBeCalledWith({
        status: 'success',
        data: {
          addedComment: {
            id: 'comment-123',
            content: 'sebuah comment',
            owner: 'user-123',
          },
        },
      });
      expect(response.code).toBeCalledWith(201);
    });

    it('should handle error when use case throws error', async () => {
      // Arrange
      const mockAddCommentUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Thread not found')),
      };
      const mockContainer = {
        getInstance: jest.fn().mockReturnValue(mockAddCommentUseCase),
      };

      const request = {
        auth: {
          credentials: { id: 'user-123' },
        },
        params: { threadId: 'thread-123' },
        payload: { content: 'sebuah comment' },
      };

      const h = {
        response: jest.fn().mockReturnValue({
          code: jest.fn(),
        }),
      };

      const handler = new CommentsHandler(mockContainer);

      // Action & Assert
      await expect(handler.postCommentHandler(request, h)).rejects.toThrow('Thread not found');
      expect(mockContainer.getInstance).toBeCalledWith('AddCommentUseCase');
      expect(mockAddCommentUseCase.execute).toBeCalledWith(
        request.payload,
        'thread-123',
        'user-123'
      );
    });
  });

  describe('deleteCommentHandler', () => {
    it('should return success status', async () => {
      // Arrange
      const mockDeleteCommentUseCase = {
        execute: jest.fn().mockResolvedValue(),
      };
      const mockContainer = {
        getInstance: jest.fn().mockReturnValue(mockDeleteCommentUseCase),
      };

      const request = {
        auth: {
          credentials: { id: 'user-123' },
        },
        params: { 
          threadId: 'thread-123',
          commentId: 'comment-123' 
        },
      };

      const h = {};

      const handler = new CommentsHandler(mockContainer);

      // Action
      const response = await handler.deleteCommentHandler(request, h);

      // Assert
      expect(mockContainer.getInstance).toBeCalledWith('DeleteCommentUseCase');
      expect(mockDeleteCommentUseCase.execute).toBeCalledWith(
        'thread-123',
        'comment-123',
        'user-123'
      );
      expect(response).toEqual({
        status: 'success',
      });
    });

    it('should handle error when use case throws error', async () => {
      // Arrange
      const mockDeleteCommentUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Comment not found')),
      };
      const mockContainer = {
        getInstance: jest.fn().mockReturnValue(mockDeleteCommentUseCase),
      };

      const request = {
        auth: {
          credentials: { id: 'user-123' },
        },
        params: { 
          threadId: 'thread-123',
          commentId: 'comment-123' 
        },
      };

      const h = {};

      const handler = new CommentsHandler(mockContainer);

      // Action & Assert
      await expect(handler.deleteCommentHandler(request, h)).rejects.toThrow('Comment not found');
      expect(mockContainer.getInstance).toBeCalledWith('DeleteCommentUseCase');
      expect(mockDeleteCommentUseCase.execute).toBeCalledWith(
        'thread-123',
        'comment-123',
        'user-123'
      );
    });

    it('should handle authorization error when user is not the owner', async () => {
      // Arrange
      const mockDeleteCommentUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('COMMENT_REPOSITORY.NOT_THE_OWNER')),
      };
      const mockContainer = {
        getInstance: jest.fn().mockReturnValue(mockDeleteCommentUseCase),
      };

      const request = {
        auth: {
          credentials: { id: 'user-456' }, // Different user
        },
        params: { 
          threadId: 'thread-123',
          commentId: 'comment-123' 
        },
      };

      const h = {};

      const handler = new CommentsHandler(mockContainer);

      // Action & Assert
      await expect(handler.deleteCommentHandler(request, h)).rejects.toThrow('COMMENT_REPOSITORY.NOT_THE_OWNER');
      expect(mockContainer.getInstance).toBeCalledWith('DeleteCommentUseCase');
      expect(mockDeleteCommentUseCase.execute).toBeCalledWith(
        'thread-123',
        'comment-123',
        'user-456'
      );
    });
  });
});

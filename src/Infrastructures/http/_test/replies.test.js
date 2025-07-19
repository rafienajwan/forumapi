const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");
const container = require("../../container");

// Helper functions for setup/teardown
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");

describe("/threads/{threadId}/comments/{commentId}/replies endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 201 and persist reply", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Act
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual("Reply content");
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Act
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {}, // Missing content
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it("should response 401 when request not contain access token", async () => {
      // Arrange
      const server = await createServer(container);

      // Act
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments/comment-123/replies",
        payload: {
          content: "Reply content",
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Act
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments/comment-123/replies",
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 404 when comment not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Act
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/comment-123/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should response 200 and soft delete reply", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Add reply
      const replyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedReply },
      } = JSON.parse(replyResponse.payload);

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 401 when request not contain access token", async () => {
      // Arrange
      const server = await createServer(container);

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/thread-123/comments/comment-123/replies/reply-123",
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it("should response 403 when user is not reply owner", async () => {
      // Arrange
      const server = await createServer(container);

      // Add first user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Add second user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "johndoe",
          password: "secret",
          fullname: "John Doe",
        },
      });

      // Login first user
      const loginResponse1 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      // Login second user
      const loginResponse2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "johndoe",
          password: "secret",
        },
      });

      const {
        data: { accessToken: accessToken1 },
      } = JSON.parse(loginResponse1.payload);

      const {
        data: { accessToken: accessToken2 },
      } = JSON.parse(loginResponse2.payload);

      // Add thread with first user
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment with first user
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Add reply with first user
      const replyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const {
        data: { addedReply },
      } = JSON.parse(replyResponse.payload);

      // Act - try to delete with second user
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/thread-123/comments/comment-123/replies/reply-123",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 404 when comment not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/comment-123/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 404 when reply not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("when GET /threads/{threadId} with replies", () => {
    it("should show replies in comments", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Add reply
      await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Act
      const response = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual("Reply content");
      expect(responseJson.data.thread.comments[0].replies[0].username).toEqual("dicoding");
    });

    it("should show deleted replies with **balasan telah dihapus** content", async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Add reply
      const replyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedReply },
      } = JSON.parse(replyResponse.payload);

      // Delete reply
      await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Act
      const response = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual("**balasan telah dihapus**");
      expect(responseJson.data.thread.comments[0].replies[0].username).toEqual("dicoding");
    });
  });
});

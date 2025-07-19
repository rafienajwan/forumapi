const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");
const container = require("../../container");

// Helper functions for setup/teardown
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");

describe("/threads/{threadId}/comments/{commentId}/likes endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should response 200 when user like comment", async () => {
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
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 200 when user unlike comment", async () => {
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

      // Like comment first
      await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Act - Unlike comment
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 401 when missing authentication", async () => {
      // Arrange
      const server = await createServer(container);

      // Act
      const response = await server.inject({
        method: "PUT",
        url: "/threads/thread-123/comments/comment-123/likes",
      });

      // Assert
      expect(response.statusCode).toEqual(401);
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
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/comment-123/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("when GET /threads/{threadId} with likes", () => {
    it("should show like count in comments", async () => {
      // Arrange
      const server = await createServer(container);

      // Add users
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "johndoe",
          password: "secret",
          fullname: "John Doe",
        },
      });

      // Login users
      const loginResponse1 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const loginResponse2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "johndoe",
          password: "secret",
        },
      });

      const accessToken1 = JSON.parse(loginResponse1.payload).data.accessToken;
      const accessToken2 = JSON.parse(loginResponse2.payload).data.accessToken;

      // Add thread
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

      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      // Add comment
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      // Like comment from both users
      await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Act
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
    });
  });
});

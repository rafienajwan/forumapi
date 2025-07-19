const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterEach(async () => {
    (await CommentsTableTestHelper.cleanTable) &&
      CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persist thread", async () => {
      const server = await createServer(container);

      // Register user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Get the actual user id from DB
      const usersQuery = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        ["dicoding"],
      );
      const userId = usersQuery.rows[0].id;

      // Login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });
      const loginJson = JSON.parse(loginResponse.payload);
      const {
        data: { accessToken },
      } = loginJson;

      // Act: add thread
      const response = await server.inject({
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

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual("Thread title");
      expect(responseJson.data.addedThread.owner).toEqual(userId);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      const server = await createServer(container);

      // Register user
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

      // Act: missing body
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 401 when not authenticated", async () => {
      const server = await createServer(container);

      // Act
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread title",
          body: "Thread body",
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should response 200 and return thread detail with comments", async () => {
      const server = await createServer(container);

      // Arrange: add user, thread, and comments
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });

      const threadDate = new Date(Date.UTC(2023, 0, 1, 0, 0, 0)).toISOString();
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Thread title",
        body: "Thread body",
        owner: "user-123",
        date: threadDate,
      });

      const commentDate1 = new Date(
        Date.UTC(2023, 0, 1, 1, 0, 0),
      ).toISOString();
      const commentDate2 = new Date(
        Date.UTC(2023, 0, 1, 2, 0, 0),
      ).toISOString();
      await CommentsTableTestHelper.addComment({
        id: "comment-1",
        thread_id: "thread-123",
        content: "A comment",
        date: commentDate1,
        owner: "user-123",
        is_delete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-2",
        thread_id: "thread-123",
        content: "Deleted comment",
        date: commentDate2,
        owner: "user-123",
        is_delete: true,
      });

      // Act
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-123",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual("thread-123");
      expect(responseJson.data.thread.title).toEqual("Thread title");
      expect(responseJson.data.thread.body).toEqual("Thread body");
      expect(responseJson.data.thread.username).toEqual("dicoding");
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual("A comment");
      expect(responseJson.data.thread.comments[1].content).toEqual(
        "**komentar telah dihapus**",
      );
    });

    it("should response 404 when thread not found", async () => {
      const server = await createServer(container);

      // Act
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-not-exist",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
    });
  });
});

describe("/threads/{threadId}/comments endpoint", () => {
  it("should respond 201 and persist comment on POST", async () => {
    // Arrange: create user, login, create thread, get accessToken
    // Act: POST /threads/{threadId}/comments
    // Assert: status 201, response contains addedComment
  });

  it("should respond 200 and soft delete comment on DELETE", async () => {
    // Arrange: create user, login, create thread, add comment, get accessToken
    // Act: DELETE /threads/{threadId}/comments/{commentId}
    // Assert: status 200, comment is soft deleted in DB
  });

  // Add negative cases: unauthorized, not owner, etc.
});

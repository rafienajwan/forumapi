const NewThread = require("../entities/NewThread");

describe("NewThread entity", () => {
  it("should throw error when not given needed property", () => {
    // Arrange
    const payload = { title: "title only" }; // missing body and owner

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when property has wrong data type", () => {
    // Arrange
    const payload = { title: 123, body: true, owner: {} };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create NewThread object correctly", () => {
    // Arrange
    const payload = {
      title: "Thread title",
      body: "Thread body",
      owner: "user-123",
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});

const AddedReply = require("../AddedReply");

describe("AddedReply entities", () => {
  it("should throw error when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "sebuah balasan",
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedReply entities correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply).toEqual({
      id: "reply-123",
      content: "sebuah balasan",
      owner: "user-123",
    });
  });
});

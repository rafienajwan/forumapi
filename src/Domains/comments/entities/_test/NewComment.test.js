const NewComment = require("../NewComment");

describe("NewComment entity", () => {
  it("should throw error when payload missing content", () => {
    expect(() => new NewComment({})).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when content is not a string", () => {
    expect(() => new NewComment({ content: 123 })).toThrowError(
      "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should throw error when content is empty", () => {
    expect(() => new NewComment({ content: "   " })).toThrowError(
      "NEW_COMMENT.CONTENT_EMPTY",
    );
  });

  it("should create NewComment object correctly", () => {
    const payload = { content: "A comment" };
    const comment = new NewComment(payload);
    expect(comment.content).toEqual(payload.content);
  });
});

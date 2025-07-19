const CommentLike = require("../CommentLike");

describe("CommentLike entity", () => {
  it("should throw error when payload missing required properties", () => {
    const payload = {
      id: "like-123",
      commentId: "comment-123",
    };

    expect(() => new CommentLike(payload)).toThrowError(
      "COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload not meet data type specification", () => {
    const payload = {
      id: 123,
      commentId: "comment-123",
      owner: "user-123",
    };

    expect(() => new CommentLike(payload)).toThrowError(
      "COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create CommentLike object correctly", () => {
    const payload = {
      id: "like-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const commentLike = new CommentLike(payload);

    expect(commentLike.id).toEqual(payload.id);
    expect(commentLike.commentId).toEqual(payload.commentId);
    expect(commentLike.owner).toEqual(payload.owner);
  });
});

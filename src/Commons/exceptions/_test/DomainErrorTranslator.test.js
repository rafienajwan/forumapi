const DomainErrorTranslator = require("../DomainErrorTranslator");
const InvariantError = require("../InvariantError");
const NotFoundError = require("../NotFoundError");
const AuthorizationError = require("../AuthorizationError");

describe("DomainErrorTranslator", () => {
  it("should translate user-related errors correctly", () => {
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena tipe data tidak sesuai",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.USERNAME_LIMIT_CHAR"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang",
      ),
    );
  });

  it("should translate thread-related errors correctly", () => {
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat thread baru karena tipe data tidak sesuai",
      ),
    );
    expect(
      DomainErrorTranslator.translate(new Error("THREAD.NOT_FOUND")),
    ).toStrictEqual(new NotFoundError("thread tidak ditemukan"));
  });

  it("should translate comment-related errors correctly", () => {
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"),
      ),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat comment baru karena tipe data tidak sesuai",
      ),
    );
    expect(
      DomainErrorTranslator.translate(new Error("NEW_COMMENT.CONTENT_EMPTY")),
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat comment baru karena content kosong",
      ),
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND"),
      ),
    ).toStrictEqual(new NotFoundError("komentar tidak ditemukan"));
    expect(
      DomainErrorTranslator.translate(
        new Error("COMMENT_REPOSITORY.NOT_THE_OWNER"),
      ),
    ).toStrictEqual(
      new AuthorizationError("anda tidak berhak mengakses resource ini"),
    );
  });

  it("should return original error when error message is not needed to translate", () => {
    // Arrange
    const error = new Error("some_error_message");

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});

const CommentRepository = require("../../Domains/comments/CommentRepository");
const { nanoid } = require("nanoid");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator = nanoid) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment, threadId, owner) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: `INSERT INTO comments (id, content, thread_id, owner, is_delete, date)
             VALUES ($1, $2, $3, $4, false, NOW())
             RETURNING id, content, owner`,
      values: [id, content, threadId, owner],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    }
    if (result.rows[0].owner !== owner) {
      throw new Error("COMMENT_REPOSITORY.NOT_THE_OWNER");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT id, content, owner, is_delete, date
             FROM comments WHERE thread_id = $1 ORDER BY date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;

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

  async verifyCommentExists(commentId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, c.content, c.owner, c.is_delete, c.date, u.username,
             COUNT(cl.id) as like_count
             FROM comments c
             LEFT JOIN users u ON c.owner = u.id
             LEFT JOIN comment_likes cl ON c.id = cl.comment_id
             WHERE c.thread_id = $1 
             GROUP BY c.id, c.content, c.owner, c.is_delete, c.date, u.username
             ORDER BY c.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async likeComment(commentId, owner) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: `INSERT INTO comment_likes (id, comment_id, owner, date)
             VALUES ($1, $2, $3, NOW())`,
      values: [id, commentId, owner],
    };
    await this._pool.query(query);
  }

  async unlikeComment(commentId, owner) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_LIKE.NOT_FOUND");
    }
  }

  async verifyCommentLike(commentId, owner) {
    const query = {
      text: "SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_LIKE.NOT_FOUND");
    }
  }
}

module.exports = CommentRepositoryPostgres;

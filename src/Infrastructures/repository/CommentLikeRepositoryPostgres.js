const CommentLikeRepository = require("../../Domains/comments/CommentLikeRepository");
const { nanoid } = require("nanoid");

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator = nanoid) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comment_likes (id, comment_id, owner, date) VALUES ($1, $2, $3, NOW()) RETURNING id",
      values: [id, commentId, owner],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async removeLike(commentId, owner) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2 RETURNING id",
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("COMMENT_LIKE_REPOSITORY.LIKE_NOT_FOUND");
    }
  }

  async verifyLikeExistence(commentId, owner) {
    const query = {
      text: "SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: "SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = CommentLikeRepositoryPostgres;

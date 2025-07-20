/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentLikesTableTestHelper = {
  async addCommentLike({
    id = 'like-123',
    userId,
    commentId,
  }) {
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner, date) VALUES($1, $2, $3, NOW())',
      values: [id, commentId, userId],
    };

    await pool.query(query);
  },

  async addLike({
    id = 'like-123',
    commentId,
    owner,
  }) {
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner, date) VALUES($1, $2, $3, NOW())',
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentLikeByUserIdAndCommentId(userId, commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;

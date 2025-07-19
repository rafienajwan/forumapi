const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const { nanoid } = require('nanoid');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator = nanoid) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, commentId, owner) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: `INSERT INTO replies (id, content, comment_id, owner, is_delete, date)
             VALUES ($1, $2, $3, $4, false, NOW())
             RETURNING id, content, owner`,
      values: [id, content, commentId, owner],
    };
    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('REPLY_REPOSITORY.REPLY_NOT_FOUND');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('REPLY_REPOSITORY.REPLY_NOT_FOUND');
    }
    if (result.rows[0].owner !== owner) {
      throw new Error('REPLY_REPOSITORY.NOT_THE_OWNER');
    }
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('REPLY_REPOSITORY.REPLY_NOT_FOUND');
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, r.content, r.date, r.is_delete, u.username
             FROM replies r
             LEFT JOIN users u ON r.owner = u.id
             WHERE r.comment_id = $1
             ORDER BY r.date ASC`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      ...row,
      date: row.date,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;

const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const { nanoid } = require("nanoid");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator = nanoid) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads (id, title, body, owner, date) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username
        FROM threads
        JOIN users ON threads.owner = users.id
        WHERE threads.id = $1
      `,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
    const row = result.rows[0];
    // Return date as string (no conversion needed, thanks to pg type parser override)
    return {
      ...row,
      date: row.date,
    };
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async verifyThreadExists(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT 
          comments.id, 
          users.username, 
          comments.date, 
          comments.content, 
          comments.is_delete,
          COALESCE(like_counts.like_count, 0) as like_count
        FROM comments
        JOIN users ON comments.owner = users.id
        LEFT JOIN (
          SELECT comment_id, COUNT(*) as like_count
          FROM comment_likes
          GROUP BY comment_id
        ) like_counts ON comments.id = like_counts.comment_id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    // Return date as string (no conversion needed, thanks to pg type parser override)
    return result.rows.map((row) => ({
      ...row,
      date: row.date,
      like_count: parseInt(row.like_count, 10),
    }));
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT 
          replies.id, 
          users.username, 
          replies.date, 
          replies.content, 
          replies.is_delete
        FROM replies
        JOIN users ON replies.owner = users.id
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      ...row,
      date: row.date,
    }));
  }
}

module.exports = ThreadRepositoryPostgres;

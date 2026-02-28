const pool = require('../config/db');

const create = async (sessionId, fromEmail, fromName, content) => {
  const result = await pool.query(
    `INSERT INTO crisp_messages (session_id, from_email, from_name, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [sessionId, fromEmail, fromName, content]
  );
  return result.rows[0];
};

const findAll = async () => {
  const result = await pool.query(
    'SELECT * FROM crisp_messages ORDER BY received_at DESC'
  );
  return result.rows;
};

const markAsRead = async (id) => {
  await pool.query(
    'UPDATE crisp_messages SET is_read = TRUE WHERE id = $1',
    [id]
  );
};

const countUnread = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM crisp_messages WHERE is_read = FALSE'
  );
  return parseInt(result.rows[0].count);
};

module.exports = { create, findAll, markAsRead, countUnread };
// backend/repositories/providerDocumentRepository.js
const pool = require('../config/db');

/**
 * Crée un document prestataire
 */
const create = async (userId, type, label, fileUrl, fileName) => {
  const result = await pool.query(
    `INSERT INTO provider_documents (user_id, type, label, file_url, file_name)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, label || null, fileUrl, fileName]
  );
  return result.rows[0];
};

/**
 * Récupère tous les documents d'un prestataire
 */
const findByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM provider_documents
     WHERE user_id = $1
     ORDER BY uploaded_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Récupère tous les documents pour l'admin (avec infos prestataire)
 */
const findAllWithProvider = async () => {
  const result = await pool.query(
    `SELECT pd.*, u.prenom, u.nom, u.email
     FROM provider_documents pd
     INNER JOIN users u ON u.id = pd.user_id
     ORDER BY pd.uploaded_at DESC`
  );
  return result.rows;
};

/**
 * Supprime un document
 */
const deleteOne = async (id, userId) => {
  await pool.query(
    'DELETE FROM provider_documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
};

const markAsRead = async (id) => {
  await pool.query(
    'UPDATE provider_documents SET is_read = TRUE WHERE id = $1',
    [id]
  );
};

const markAllAsRead = async () => {
  await pool.query(
    'UPDATE provider_documents SET is_read = TRUE WHERE is_read = FALSE'
  );
};

const countUnread = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM provider_documents WHERE is_read = FALSE'
  );
  return parseInt(result.rows[0].count);
};

const adminDeleteOne = async (id) => {
  await pool.query('DELETE FROM provider_documents WHERE id = $1', [id]);
};


module.exports = {
  create,
  findByUserId,
  findAllWithProvider,
  deleteOne,
  adminDeleteOne,
  countUnread,
  markAllAsRead,
  markAsRead
};
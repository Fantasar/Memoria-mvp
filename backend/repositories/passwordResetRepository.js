// backend/repositories/passwordResetRepository.js
const pool = require('../config/db');

/**
 * Crée un token de réinitialisation (supprime les anciens d'abord)
 */
const create = async (userId, token) => {
  // Supprime les anciens tokens de cet utilisateur
  await pool.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1',
    [userId]
  );

  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
     RETURNING *`,
    [userId, token]
  );
  return result.rows[0];
};

/**
 * Vérifie qu'un token est valide (non expiré, non utilisé)
 */
const verify = async (telephone, token) => {
  const result = await pool.query(
    `SELECT prt.* FROM password_reset_tokens prt
     INNER JOIN users u ON u.id = prt.user_id
     WHERE u.telephone = $1
       AND prt.token = $2
       AND prt.expires_at > NOW()
       AND prt.used = FALSE`,
    [telephone, token]
  );
  return result.rows[0];
};

/**
 * Marque un token comme utilisé
 */
const markAsUsed = async (id) => {
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
    [id]
  );
};

module.exports = { create, verify, markAsUsed };
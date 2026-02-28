// backend/repositories/passwordResetRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `password_reset_tokens`.
 * Gère les tokens de réinitialisation de mot de passe envoyés par SMS.
 * Chaque token est valable 15 minutes et ne peut être utilisé qu'une seule fois.
 */

/**
 * Crée un nouveau token de réinitialisation pour un utilisateur
 * Supprime les tokens précédents avant insertion pour éviter les doublons
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} token  - Code à 6 chiffres généré par passwordResetService
 * @returns {Object}      - Le token créé
 */
const create = async (userId, token) => {
  // Supprime les anciens tokens de cet utilisateur avant d'en créer un nouveau
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
 * Vérifie qu'un token est valide pour un numéro de téléphone donné
 * Rejette automatiquement les tokens expirés ou déjà utilisés
 * @param {string} telephone - Numéro au format stocké en base (ex: 0612345678)
 * @param {string} token     - Code à 6 chiffres saisi par l'utilisateur
 * @returns {Object|undefined} - Le token si valide, undefined sinon
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
 * Invalide un token après utilisation pour éviter toute réutilisation
 * @param {number} id - Identifiant du token
 * @returns {void}
 */
const markAsUsed = async (id) => {
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
    [id]
  );
};

module.exports = { create, verify, markAsUsed };
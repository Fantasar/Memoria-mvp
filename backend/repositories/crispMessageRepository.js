// backend/repositories/crispMessageRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `crisp_messages`.
 * Gère la persistance des messages reçus via le webhook Crisp.
 * Alimente le dashboard admin avec les conversations du chat en temps réel.
 */

/**
 * Enregistre un nouveau message reçu depuis le webhook Crisp
 * @param {string} sessionId  - Identifiant de la session Crisp
 * @param {string} fromEmail  - Email du visiteur (peut être null si non renseigné)
 * @param {string} fromName   - Nom du visiteur (défaut : 'Visiteur')
 * @param {string} content    - Contenu du message
 * @returns {Object}          - Le message créé
 */
const create = async (sessionId, fromEmail, fromName, content) => {
  const result = await pool.query(
    `INSERT INTO crisp_messages (session_id, from_email, from_name, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [sessionId, fromEmail, fromName, content]
  );
  return result.rows[0];
};

/**
 * Récupère tous les messages Crisp triés du plus récent au plus ancien
 * @returns {Array}
 */
const findAll = async () => {
  const result = await pool.query(
    'SELECT * FROM crisp_messages ORDER BY received_at DESC'
  );
  return result.rows;
};

/**
 * Marque un message spécifique comme lu
 * @param {number} id - Identifiant du message
 * @returns {void}
 */
const markAsRead = async (id) => {
  await pool.query(
    'UPDATE crisp_messages SET is_read = TRUE WHERE id = $1',
    [id]
  );
};

/**
 * Compte le nombre de messages non lus
 * Utilisé pour afficher le badge de compteur dans le dashboard admin
 * @returns {number}
 */
const countUnread = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM crisp_messages WHERE is_read = FALSE'
  );
  return parseInt(result.rows[0].count);
};

/**
 * Marque tous les messages non lus comme lus
 * Appelé via le bouton "Tout marquer comme lu" dans le dashboard admin
 * @returns {void}
 */
const markAllAsRead = async () => {
  await pool.query('UPDATE crisp_messages SET is_read = TRUE WHERE is_read = FALSE');
};

/**
 * Supprime un message spécifique
 * @param {number} id - Identifiant du message
 * @returns {void}
 */
const deleteOne = async (id) => {
  await pool.query('DELETE FROM crisp_messages WHERE id = $1', [id]);
};

/**
 * Supprime tous les messages Crisp
 * Appelé via le bouton "Tout supprimer" dans le dashboard admin
 * @returns {void}
 */
const deleteAll = async () => {
  await pool.query('DELETE FROM crisp_messages');
};

module.exports = {
  create,
  findAll,
  markAsRead,
  countUnread,
  markAllAsRead,
  deleteOne,
  deleteAll
};
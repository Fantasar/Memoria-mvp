// backend/repositories/providerDocumentRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `provider_documents`.
 * Gère les documents administratifs uploadés par les prestataires (RIB, KBIS, assurance, etc.).
 * Les fichiers sont stockés sur Cloudinary — seule l'URL est persistée en base.
 */

/**
 * Enregistre un nouveau document prestataire après upload Cloudinary
 * @param {string} userId   - Identifiant du prestataire
 * @param {string} type     - Type de document (rib, kbis, assurance, identite, autre)
 * @param {string} label    - Libellé libre (obligatoire si type === 'autre', null sinon)
 * @param {string} fileUrl  - URL Cloudinary du fichier uploadé
 * @param {string} fileName - Nom original du fichier
 * @returns {Object}        - Le document créé
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
 * Récupère tous les documents d'un prestataire triés du plus récent au plus ancien
 * @param {string} userId - Identifiant du prestataire
 * @returns {Array}
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
 * Récupère tous les documents avec les informations du prestataire associé
 * Utilisé par le dashboard admin pour la validation des dossiers
 * @returns {Array}
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
 * Supprime un document en vérifiant que le prestataire en est le propriétaire
 * La condition AND user_id = $2 empêche la suppression des documents d'un autre prestataire
 * @param {number} id     - Identifiant du document
 * @param {string} userId - Identifiant du prestataire propriétaire
 * @returns {void}
 */
const deleteOne = async (id, userId) => {
  await pool.query(
    'DELETE FROM provider_documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
};

/**
 * Supprime un document sans vérification de propriétaire
 * Réservé à l'usage admin uniquement
 * @param {number} id - Identifiant du document
 * @returns {void}
 */
const adminDeleteOne = async (id) => {
  await pool.query('DELETE FROM provider_documents WHERE id = $1', [id]);
};

/**
 * Marque un document spécifique comme lu par l'admin
 * @param {number} id - Identifiant du document
 * @returns {void}
 */
const markAsRead = async (id) => {
  await pool.query(
    'UPDATE provider_documents SET is_read = TRUE WHERE id = $1',
    [id]
  );
};

/**
 * Marque tous les documents non lus comme lus
 * Appelé via le bouton "Tout marquer comme lu" dans le dashboard admin
 * @returns {void}
 */
const markAllAsRead = async () => {
  await pool.query(
    'UPDATE provider_documents SET is_read = TRUE WHERE is_read = FALSE'
  );
};

/**
 * Compte le nombre de documents non lus
 * Utilisé pour afficher le badge de compteur dans le dashboard admin
 * @returns {number}
 */
const countUnread = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM provider_documents WHERE is_read = FALSE'
  );
  return parseInt(result.rows[0].count);
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
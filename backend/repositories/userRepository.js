// backend/repositories/userRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `users`.
 * Gère les trois rôles de la plateforme via la colonne role_id.
 * Utilisé par authService, adminService et providerService.
 */

// Colonnes communes aux requêtes findBy — factorisées pour éviter la duplication
const USER_SELECT = `
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.prenom,
    u.nom,
    u.zone_intervention,
    u.siret,
    u.is_verified,
    u.created_at,
    r.name as role
  FROM users u
  INNER JOIN roles r ON u.role_id = r.id
`;

/**
 * Récupère un utilisateur par son email (avec son rôle)
 * @param {string} email
 * @returns {Object|undefined}
 */
const findByEmail = async (email) => {
  try {
    const result = await pool.query(
      `${USER_SELECT} WHERE u.email = $1`,
      [email]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.findByEmail : ${error.message}`);
  }
};

/**
 * Récupère un utilisateur par son ID (avec son rôle)
 * @param {number} userId
 * @returns {Object|undefined}
 */
const findById = async (userId) => {
  try {
    const result = await pool.query(
      `${USER_SELECT} WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.findById : ${error.message}`);
  }
};

/**
 * Vérifie si un email est déjà utilisé
 * @param {string} email
 * @returns {boolean}
 */
const emailExists = async (email) => {
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`userRepository.emailExists : ${error.message}`);
  }
};

/**
 * Crée un nouvel utilisateur
 * @param {Object} userData - { email, password_hash, role_id, prenom, nom, zone_intervention, siret }
 * @returns {Object} - L'utilisateur créé
 */
const create = async (userData) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role_id, prenom, nom, zone_intervention, siret)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role_id, prenom, nom, zone_intervention, siret, created_at`,
      [
        userData.email,
        userData.password_hash,
        userData.role_id,
        userData.prenom        || null,
        userData.nom           || null,
        userData.zone_intervention || null,
        userData.siret         || null
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.create : ${error.message}`);
  }
};

/**
 * Met à jour les informations d'un utilisateur
 * @param {number} userId
 * @param {Object} userData - { email, prenom, nom, zone_intervention, siret }
 * @returns {Object} - L'utilisateur mis à jour
 */
const update = async (userId, userData) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET email = $1, prenom = $2, nom = $3, zone_intervention = $4, siret = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, email, prenom, nom, role_id, zone_intervention, siret, updated_at`,
      [
        userData.email,
        userData.prenom            || null,
        userData.nom               || null,
        userData.zone_intervention || null,
        userData.siret             || null,
        userId
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.update : ${error.message}`);
  }
};

/**
 * Supprime un utilisateur par son ID
 * Note : en production, privilégier un soft delete via un champ deleted_at
 * @param {number} userId
 * @returns {Object} - { id } de l'utilisateur supprimé
 */
const deleteById = async (userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.deleteById : ${error.message}`);
  }
};

/**
 * Récupère tous les prestataires en attente de validation admin
 * @returns {Array}
 */
const findPendingProviders = async () => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.email, u.prenom, u.nom,
         u.zone_intervention, u.siret,
         u.is_verified, u.created_at,
         r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'prestataire'
         AND u.is_verified = false
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.findPendingProviders : ${error.message}`);
  }
};

/**
 * Valide un prestataire (passe is_verified à true)
 * @param {number} providerId
 * @returns {Object} - Le prestataire mis à jour
 */
const approveProvider = async (providerId) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = true, verified_at = NOW()
       WHERE id = $1
       RETURNING id, email, prenom, nom, is_verified, verified_at`,
      [providerId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.approveProvider : ${error.message}`);
  }
};

/**
 * Rejette un prestataire avec une raison
 * @param {number} providerId
 * @param {string} reason - Motif du rejet affiché au prestataire
 * @returns {Object} - Le prestataire mis à jour
 */
const rejectProvider = async (providerId, reason) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = false, rejection_reason = $1, rejected_at = NOW()
       WHERE id = $2
       RETURNING id, email, prenom, nom, rejection_reason, rejected_at`,
      [reason, providerId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.rejectProvider : ${error.message}`);
  }
};

/**
 * Récupère tous les utilisateurs sauf les admins et les comptes supprimés
 * Utilisé par le dashboard administrateur
 * @returns {Array}
 */
const getAllUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.prenom, u.nom, u.email,
         u.created_at, u.is_verified,
         u.siret, u.zone_intervention,
         u.rating, u.rejection_reason,
         r.name as role
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE r.name != 'admin'
         AND u.deleted_at IS NULL
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.getAllUsers : ${error.message}`);
  }
};

/**
 * Met à jour la zone d'intervention d'un prestataire
 * @param {number} userId
 * @param {string} zone
 * @returns {Object} - L'utilisateur mis à jour
 */
const updateZone = async (userId, zone) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET zone_intervention = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, zone_intervention, updated_at`,
      [zone, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.updateZone : ${error.message}`);
  }
};

module.exports = {
  findByEmail,
  findById,
  emailExists,
  create,
  update,
  deleteById,
  findPendingProviders,
  approveProvider,
  rejectProvider,
  getAllUsers,
  updateZone
};
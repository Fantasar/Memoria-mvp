// backend/repositories/userRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `users`.
 * Gère les trois rôles de la plateforme : client, prestataire, admin (via role_id).
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
 * @param {string} userId
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
 * Récupère un utilisateur par son numéro de téléphone
 * Utilisé par passwordResetService pour identifier l'utilisateur avant l'envoi du SMS
 * @param {string} telephone - Numéro au format stocké en base (ex: 0612345678)
 * @returns {Array}
 */
const findByTelephone = async (telephone) => {
  try {
    const result = await pool.query(
      'SELECT id, prenom FROM users WHERE telephone = $1',
      [telephone]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.findByTelephone : ${error.message}`);
  }
};

/**
 * Récupère tous les utilisateurs d'un rôle donné
 * Utilisé notamment pour trouver les admins destinataires des notifications de contact
 * @param {string} role - Nom du rôle (client, prestataire, admin)
 * @returns {Array}
 */
const findByRole = async (role) => {
  try {
    const result = await pool.query(
      `SELECT u.* FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE r.name = $1
       LIMIT 1`,
      [role]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.findByRole : ${error.message}`);
  }
};

/**
 * Vérifie si un email est déjà utilisé
 * Appelé lors de l'inscription pour éviter les doublons
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
 * @param {Object} userData - { email, password_hash, role_id, prenom, nom, telephone, zone_intervention, siret }
 * @returns {Object}        - L'utilisateur créé
 */
const create = async (userData) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role_id, prenom, nom, telephone, zone_intervention, siret)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, role_id, prenom, nom, telephone, zone_intervention, siret, created_at`,
      [
        userData.email,
        userData.password_hash,
        userData.role_id,
        userData.prenom || null,
        userData.nom || null,
        userData.telephone || null,
        userData.zone_intervention || null,
        userData.siret || null
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.create : ${error.message}`);
  }
};

/**
 * Met à jour les informations de profil d'un utilisateur
 * @param {string} userId
 * @param {Object} userData - { email, prenom, nom, telephone, zone_intervention, siret }
 * @returns {Object}        - L'utilisateur mis à jour
 */
const update = async (userId, userData) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET email = $1, prenom = $2, nom = $3, telephone = $4, zone_intervention = $5, siret = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, email, prenom, nom, telephone, role_id, zone_intervention, siret, updated_at`,
      [
        userData.email,
        userData.prenom || null,
        userData.nom || null,
        userData.telephone || null,
        userData.zone_intervention || null,
        userData.siret || null,
        userId
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.update : ${error.message}`);
  }
};

/**
 * Met à jour le mot de passe hashé d'un utilisateur
 * Appelé par authService (changement de mot de passe) et passwordResetService (réinitialisation)
 * @param {string} userId       - Identifiant de l'utilisateur
 * @param {string} passwordHash - Nouveau mot de passe déjà hashé par bcrypt
 * @returns {Object}            - { id } de l'utilisateur mis à jour
 */
const updatePassword = async (userId, passwordHash) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [passwordHash, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.updatePassword : ${error.message}`);
  }
};

/**
 * Supprime définitivement un utilisateur par son ID
 * ️ Suppression physique — en production, privilégier le soft delete via deleted_at
 * @param {string} userId
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
 * Exclut les prestataires déjà rejetés (rejected_at IS NULL)
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
         AND u.rejected_at IS NULL
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.findPendingProviders : ${error.message}`);
  }
};

/**
 * Valide un prestataire — passe is_verified à true et enregistre la date de validation
 * @param {string} providerId
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
 * Rejette un prestataire avec un motif affiché dans son dashboard
 * @param {string} providerId
 * @param {string} reason - Motif du rejet visible par le prestataire
 * @returns {Object}      - Le prestataire mis à jour
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
 * Récupère tous les utilisateurs sauf les admins et les comptes supprimés (soft delete)
 * Inclut le nombre de commandes associées selon le rôle (client ou prestataire)
 * Utilisé par le dashboard administrateur pour la gestion des comptes
 * @returns {Array}
 */
const getAllUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT
        u.id, u.prenom, u.nom, u.email,
        u.created_at, u.is_verified, u.is_blocked,
        u.siret, u.zone_intervention,
        u.rating, u.rejection_reason,
        r.name as role,
        COUNT(DISTINCT CASE 
        WHEN r.name = 'client'      THEN o_client.id 
        WHEN r.name = 'prestataire' THEN o_provider.id 
        END) AS orders_count
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       LEFT JOIN orders o ON o.client_id = u.id
       LEFT JOIN orders o_client   ON o_client.client_id      = u.id
       LEFT JOIN orders o_provider ON o_provider.prestataire_id = u.id
       WHERE r.name != 'admin'
         AND u.deleted_at IS NULL
       GROUP BY u.id, u.prenom, u.nom, u.email,
                u.created_at, u.is_verified, u.is_blocked,
                u.siret, u.zone_intervention,
                u.rating, u.rejection_reason, r.name
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`userRepository.getAllUsers : ${error.message}`);
  }
};

/**
 * Met à jour la zone d'intervention d'un prestataire
 * @param {string} userId
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
  };
};

/**
 * Réinitialise le rejet d'un prestataire pour lui permettre de soumettre à nouveau
 * Efface rejection_reason et rejected_at — le dossier repasse en attente de validation
 * @param {string} userId
 * @returns {Object} - L'utilisateur mis à jour
 */
const resetRejection = async (userId) => {
  try {
    const result = await pool.query(
      `UPDATE users
      SET rejection_reason = NULL, rejected_at = NULL, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, prenom, nom, is_verified, rejected_at`,
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.resetRejection : ${error.message}`);
  }
};

/**
 * Bloque ou débloque un utilisateur selon la valeur de isBlocked
 * Un compte bloqué ne peut plus se connecter à la plateforme
 * @param {string}  userId    - Identifiant de l'utilisateur
 * @param {boolean} isBlocked - true pour bloquer, false pour débloquer
 * @returns {Object}          - L'utilisateur mis à jour
 */
const toggleBlock = async (userId, isBlocked) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET is_blocked = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, prenom, nom, is_blocked`,
      [isBlocked, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`userRepository.toggleBlock : ${error.message}`);
  }
};

module.exports = {
  findByEmail,
  findById,
  findByRole,
  findByTelephone,
  emailExists,
  create,
  update,
  updatePassword,
  deleteById,
  findPendingProviders,
  approveProvider,
  rejectProvider,
  getAllUsers,
  updateZone,
  resetRejection,
  toggleBlock
};
// backend/repositories/userRepository.js
const pool = require('../config/db');

/**
 * REPOSITORY : Accès aux données utilisateurs
 * Responsabilité : Requêtes SQL sur users uniquement
 */

/**
 * Trouver un utilisateur par email (avec son rôle via JOIN)
 */
const findByEmail = async (email) => {
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      r.name as role,
      u.zone_intervention, 
      u.siret,
      u.created_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0]; // undefined si non trouvé
};

/**
 * Trouver un utilisateur par ID (avec son rôle via JOIN)
 */
const findById = async (userId) => {
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      r.name as role,
      u.zone_intervention, 
      u.siret,
      u.created_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

/**
 * Vérifier si un email existe déjà
 */
const emailExists = async (email) => {
  const query = 'SELECT id FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows.length > 0;
};

/**
 * Créer un nouvel utilisateur
 */
const create = async (userData) => {
  const query = `
    INSERT INTO users (email, password_hash, role_id, zone_intervention, siret, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, email, role_id, zone_intervention, siret, created_at
  `;
  
  const values = [
    userData.email,
    userData.password_hash,
    userData.role_id,
    userData.zone_intervention || null,
    userData.siret || null
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Mettre à jour un utilisateur
 */
const update = async (userId, userData) => {
  const query = `
    UPDATE users 
    SET email = $1, zone_intervention = $2, siret = $3
    WHERE id = $4
    RETURNING id, email, role_id, zone_intervention, siret
  `;
  
  const values = [
    userData.email,
    userData.zone_intervention,
    userData.siret,
    userId
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Supprimer un utilisateur (soft delete recommandé en production)
 */
const deleteById = async (userId) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

/**
 * Récupérer les prestataires en attente de validation
 */
const findPendingProviders = async () => {
  const query = `
    SELECT 
      u.id,
      u.email,
      u.prenom,
      u.nom,
      u.zone_intervention,
      u.siret,
      u.is_verified,
      u.created_at,
      r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'prestataire'
      AND u.is_verified = false
    ORDER BY u.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Valider un prestataire (changer is_verified)
 */
const approveProvider = async (providerId) => {
  const query = `
    UPDATE users
    SET 
      is_verified = true,
      verified_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [providerId]);
  return result.rows[0];
};

/**
 * Rejeter un prestataire (supprimer ou désactiver)
 */
const rejectProvider = async (providerId, reason) => {
  const query = `
    UPDATE users
    SET 
      is_verified = false,
      rejection_reason = $1,
      rejected_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [reason, providerId]);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  emailExists,
  create,
  update,
  findPendingProviders,
  approveProvider,
  rejectProvider,
  deleteById
};
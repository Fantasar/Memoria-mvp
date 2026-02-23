// backend/repositories/roleRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `roles`.
 * Gère les 3 rôles de la plateforme : client, prestataire, admin.
 * Utilisé principalement par authService lors de l'inscription.
 */

/**
 * Récupère un rôle par son nom
 * @param {string} roleName - ex: 'client', 'prestataire', 'admin'
 * @returns {Object|undefined} - { id, name } ou undefined si non trouvé
 */
const findByName = async (roleName) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM roles WHERE name = $1',
      [roleName]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`roleRepository.findByName : ${error.message}`);
  }
};

/**
 * Récupère un rôle par son ID
 * @param {number} roleId
 * @returns {Object|undefined} - { id, name } ou undefined si non trouvé
 */
const findById = async (roleId) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM roles WHERE id = $1',
      [roleId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`roleRepository.findById : ${error.message}`);
  }
};

/**
 * Récupère tous les rôles disponibles
 * @returns {Array} - [{ id, name }, ...]
 */
const findAll = async () => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM roles ORDER BY id'
    );
    return result.rows;
  } catch (error) {
    throw new Error(`roleRepository.findAll : ${error.message}`);
  }
};

/**
 * Vérifie si un rôle existe en base
 * @param {string} roleName
 * @returns {boolean}
 */
const exists = async (roleName) => {
  try {
    const result = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [roleName]
    );
    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`roleRepository.exists : ${error.message}`);
  }
};

module.exports = { findByName, findById, findAll, exists };
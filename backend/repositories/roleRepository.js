// backend/repositories/roleRepository.js
const pool = require('../config/db');

/**
 * REPOSITORY : Accès à la table roles
 * Responsabilité : Requêtes SQL sur roles uniquement
 */

/**
 * Récupérer un rôle par son nom
 */
const findByName = async (roleName) => {
  const query = 'SELECT id, name FROM roles WHERE name = $1';
  const result = await pool.query(query, [roleName]);
  return result.rows[0]; // {id: 1, name: 'client'} ou undefined
};

/**
 * Récupérer un rôle par son ID
 */
const findById = async (roleId) => {
  const query = 'SELECT id, name FROM roles WHERE id = $1';
  const result = await pool.query(query, [roleId]);
  return result.rows[0]; // {id: 1, name: 'client'} ou undefined
};

/**
 * Récupérer tous les rôles
 */
const findAll = async () => {
  const query = 'SELECT id, name FROM roles ORDER BY id';
  const result = await pool.query(query);
  return result.rows; // [{id: 1, name: 'client'}, ...]
};

/**
 * Vérifier si un rôle existe
 */
const exists = async (roleName) => {
  const query = 'SELECT id FROM roles WHERE name = $1';
  const result = await pool.query(query, [roleName]);
  return result.rows.length > 0;
};

module.exports = {
  findByName,
  findById,
  findAll,
  exists
};
// backend/repositories/cemeteryRepository.js
const pool = require('../config/db');

/**
 * REPOSITORY : Accès à la table cemeteries
 * Responsabilité : Requêtes SQL uniquement
 */

/**
 * Récupérer tous les cimetières actifs
 */
const findAllActive = async () => {
  const query = `
    SELECT 
      id, 
      name, 
      city, 
      postal_code, 
      department
    FROM cemeteries
    WHERE is_active = true
    ORDER BY department, city, name
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Vérifier si un cimetière existe et est actif
 */
const existsById = async (cemeteryId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM cemeteries 
      WHERE id = $1 AND is_active = true
    ) as exists
  `;
  const result = await pool.query(query, [cemeteryId]);
  return result.rows[0].exists;
};

module.exports = {
  findAllActive,
  existsById
};
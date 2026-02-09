// backend/repositories/serviceCategoryRepository.js
const pool = require('../config/db');

/**
 * REPOSITORY : Accès à la table service_categories
 * Responsabilité : Requêtes SQL uniquement
 */

/**
 * Récupérer toutes les catégories de services actives
 */
const findAllActive = async () => {
  const query = `
    SELECT 
      id, 
      name, 
      description, 
      base_price
    FROM service_categories
    WHERE is_active = true
    ORDER BY base_price ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Vérifier si une catégorie existe et est active
 */
const existsById = async (categoryId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM service_categories 
      WHERE id = $1 AND is_active = true
    ) as exists
  `;
  const result = await pool.query(query, [categoryId]);
  return result.rows[0].exists;
};

/**
 * Récupérer le prix d'une catégorie
 */
const getPriceById = async (categoryId) => {
  const query = `
    SELECT base_price 
    FROM service_categories 
    WHERE id = $1 AND is_active = true
  `;
  const result = await pool.query(query, [categoryId]);
  return result.rows[0]?.base_price || null;
};

module.exports = {
  findAllActive,
  existsById,
  getPriceById
};
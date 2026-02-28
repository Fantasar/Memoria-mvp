// backend/repositories/serviceCategoryRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `service_categories`.
 * Gère le catalogue des prestations disponibles sur la plateforme.
 * Utilisé lors de la création de commande (validation + calcul du prix)
 * et dans le dashboard admin pour la gestion du catalogue.
 */

/**
 * Récupère les catégories actives uniquement — version client/prestataire
 * Triées par prix croissant pour l'affichage dans le formulaire de commande
 * @returns {Array} - [{ id, name, description, base_price }, ...]
 */
const findAllActive = async () => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, base_price, category
       FROM service_categories
       WHERE is_active = true
       ORDER BY category, id`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`serviceCategoryRepository.findAllActive : ${error.message}`);
  }
};

/**
 * Récupère toutes les catégories y compris inactives — version admin uniquement
 * Inclut le compteur de commandes associées pour les statistiques
 * @returns {Array} - [{ id, name, description, base_price, is_active, orders_count }, ...]
 */
const findAll = async () => {
  try {
    const result = await pool.query(
      `SELECT
         sc.id,
         sc.name,
         sc.description,
         sc.base_price,
         sc.is_active,
         sc.created_at,
         sc.updated_at,
         COUNT(o.id)::integer AS orders_count
       FROM service_categories sc
       LEFT JOIN orders o ON o.service_category_id = sc.id
       GROUP BY sc.id
       ORDER BY sc.name ASC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`serviceCategoryRepository.findAll : ${error.message}`);
  }
};

/**
 * Récupère une catégorie par son ID (active ou non)
 * @param {number} id
 * @returns {Object|null}
 */
const findById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, base_price, is_active
       FROM service_categories
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`serviceCategoryRepository.findById : ${error.message}`);
  }
};

/**
 * Vérifie qu'une catégorie existe et est active
 * Utilisé pour valider le service_category_id avant création d'une commande
 * @param {number} categoryId
 * @returns {boolean}
 */
const existsById = async (categoryId) => {
  try {
    const result = await pool.query(
      `SELECT EXISTS(
         SELECT 1 FROM service_categories
         WHERE id = $1 AND is_active = true
       ) AS exists`,
      [categoryId]
    );
    return result.rows[0].exists;
  } catch (error) {
    throw new Error(`serviceCategoryRepository.existsById : ${error.message}`);
  }
};

/**
 * Récupère le prix de base d'une catégorie active
 * Utilisé par orderService pour calculer le montant de la commande
 * @param {number} categoryId
 * @returns {number|null} - Le prix en euros ou null si non trouvé
 */
const getPriceById = async (categoryId) => {
  try {
    const result = await pool.query(
      `SELECT base_price
       FROM service_categories
       WHERE id = $1 AND is_active = true`,
      [categoryId]
    );
    return result.rows[0]?.base_price || null;
  } catch (error) {
    throw new Error(`serviceCategoryRepository.getPriceById : ${error.message}`);
  }
};

/**
 * Crée une nouvelle catégorie de service (usage admin uniquement)
 * @param {Object} data - { name, description, base_price }
 * @returns {Object} - La catégorie créée
 */
const createServiceCategory = async ({ name, description, base_price }) => {
  try {
    const result = await pool.query(
      `INSERT INTO service_categories (name, description, base_price)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, base_price, is_active, created_at`,
      [name, description || null, base_price]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`serviceCategoryRepository.createServiceCategory : ${error.message}`);
  }
};

module.exports = {
  findAllActive,
  findAll,
  findById,
  existsById,
  getPriceById,
  createServiceCategory
};
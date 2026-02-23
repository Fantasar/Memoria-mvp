// backend/repositories/reviewRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `reviews`.
 * Gère les avis et notes laissés par les clients après validation d'une intervention.
 * La note moyenne calculée ici alimente le profil prestataire
 * et influence la confiance des futurs clients.
 */

/**
 * Crée un nouvel avis
 * Un seul avis est autorisé par commande (vérifié via existsByOrderId avant appel)
 * @param {Object} reviewData - { order_id, client_id, prestataire_id, rating, comment }
 * @returns {Object} - L'avis créé
 */
const create = async (reviewData) => {
  try {
    const result = await pool.query(
      `INSERT INTO reviews (order_id, client_id, prestataire_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, order_id, client_id, prestataire_id, rating, comment, created_at`,
      [
        reviewData.order_id,
        reviewData.client_id,
        reviewData.prestataire_id,
        reviewData.rating,
        reviewData.comment
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`reviewRepository.create : ${error.message}`);
  }
};

/**
 * Récupère tous les avis d'un prestataire avec le contexte de la commande
 * @param {number} prestataireId
 * @returns {Array} - [{ id, rating, comment, client_prenom, service_name, cemetery_name, ... }]
 */
const findByPrestataire = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id, r.rating, r.comment, r.created_at,
         u.prenom          AS client_prenom,
         u.nom             AS client_nom,
         sc.name           AS service_name,
         c.name            AS cemetery_name
       FROM reviews r
       LEFT JOIN users u              ON r.client_id           = u.id
       LEFT JOIN orders o             ON r.order_id            = o.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       LEFT JOIN cemeteries c         ON o.cemetery_id         = c.id
       WHERE r.prestataire_id = $1
       ORDER BY r.created_at DESC`,
      [prestataireId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`reviewRepository.findByPrestataire : ${error.message}`);
  }
};

/**
 * Calcule la note moyenne et le nombre total d'avis d'un prestataire
 * @param {number} prestataireId
 * @returns {Object} - { average_rating, total_reviews }
 */
const getAverageRating = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         ROUND(AVG(rating)::numeric, 1) AS average_rating,
         COUNT(*)                        AS total_reviews
       FROM reviews
       WHERE prestataire_id = $1`,
      [prestataireId]
    );
    return {
      average_rating: parseFloat(result.rows[0].average_rating) || 0,
      total_reviews:  parseInt(result.rows[0].total_reviews)
    };
  } catch (error) {
    throw new Error(`reviewRepository.getAverageRating : ${error.message}`);
  }
};

/**
 * Vérifie si une commande a déjà été évaluée
 * Utilisé avant create() pour garantir un seul avis par commande
 * @param {number} orderId
 * @returns {boolean}
 */
const existsByOrderId = async (orderId) => {
  try {
    const result = await pool.query(
      `SELECT id FROM reviews WHERE order_id = $1`,
      [orderId]
    );
    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`reviewRepository.existsByOrderId : ${error.message}`);
  }
};

/**
 * Récupère l'avis associé à une commande
 * @param {number} orderId
 * @returns {Object|undefined}
 */
const findByOrderId = async (orderId) => {
  try {
    const result = await pool.query(
      `SELECT id, order_id, client_id, prestataire_id, rating, comment, created_at
       FROM reviews
       WHERE order_id = $1`,
      [orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`reviewRepository.findByOrderId : ${error.message}`);
  }
};

module.exports = {
  create,
  findByPrestataire,
  getAverageRating,
  existsByOrderId,
  findByOrderId
};
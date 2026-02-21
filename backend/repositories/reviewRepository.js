const pool = require('../config/db');

/**
 * Créer une évaluation
 */
async function create(reviewData) {
  const query = `
    INSERT INTO reviews (order_id, client_id, prestataire_id, rating, comment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    reviewData.order_id,
    reviewData.client_id,
    reviewData.prestataire_id,
    reviewData.rating,
    reviewData.comment
  ]);
  
  return result.rows[0];
}

/**
 * Récupérer les évaluations d'un prestataire
 */
async function findByPrestataire(prestatairId) {
  const query = `
    SELECT 
      r.*,
      u.prenom as client_prenom,
      u.nom as client_nom,
      o.service_category_id,
      sc.name as service_name,
      c.name as cemetery_name
    FROM reviews r
    LEFT JOIN users u ON r.client_id = u.id
    LEFT JOIN orders o ON r.order_id = o.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    WHERE r.prestataire_id = $1
    ORDER BY r.created_at DESC
  `;
  
  const result = await pool.query(query, [prestatairId]);
  return result.rows;
}

/**
 * Calculer la note moyenne d'un prestataire
 */
async function getAverageRating(prestatairId) {
  const query = `
    SELECT 
      ROUND(AVG(rating)::numeric, 1) as average_rating,
      COUNT(*) as total_reviews
    FROM reviews
    WHERE prestataire_id = $1
  `;
  
  const result = await pool.query(query, [prestatairId]);
  return {
    average_rating: parseFloat(result.rows[0].average_rating) || 0,
    total_reviews: parseInt(result.rows[0].total_reviews)
  };
}

/**
 * Vérifier si une commande a déjà été évaluée
 */
async function existsByOrderId(orderId) {
  const query = `SELECT id FROM reviews WHERE order_id = $1`;
  const result = await pool.query(query, [orderId]);
  return result.rows.length > 0;
}

/**
 * Récupérer une évaluation par order_id
 */
async function findByOrderId(orderId) {
  const query = `SELECT * FROM reviews WHERE order_id = $1`;
  const result = await pool.query(query, [orderId]);
  return result.rows[0];
}

module.exports = {
  create,
  findByPrestataire,
  getAverageRating,
  existsByOrderId,
  findByOrderId
};
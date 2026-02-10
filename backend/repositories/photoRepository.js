const pool = require('../config/db');

/**
 * REPOSITORY : Accès à la table photos
 */

/**
 * Créer une nouvelle photo
 */
const create = async (photoData) => {
  const query = `
    INSERT INTO photos (
      order_id,
      photo_type,
      cloudinary_url,
      cloudinary_public_id,
      uploaded_at
    )
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  
  const values = [
    photoData.order_id,
    photoData.photo_type,
    photoData.cloudinary_url,
    photoData.cloudinary_public_id
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Récupérer les photos d'une commande
 */
const findByOrderId = async (orderId) => {
  const query = `
    SELECT * FROM photos
    WHERE order_id = $1
    ORDER BY uploaded_at DESC
  `;
  const result = await pool.query(query, [orderId]);
  return result.rows;
};

/**
 * Supprimer une photo
 */
const deleteById = async (photoId) => {
  const query = `DELETE FROM photos WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [photoId]);
  return result.rows[0];
};

module.exports = {
  create,
  findByOrderId,
  deleteById
};
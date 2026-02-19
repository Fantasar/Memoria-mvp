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
      type,
      url,
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

const getAllPhotos = async () => {
  const query = `
    SELECT 
      p.*,
      o.cemetery_id,
      o.status as order_status,
      o.price,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name,
      uc.email as client_email,
      up.email as prestataire_email,
      up.prenom as prestataire_prenom,
      up.nom as prestataire_nom
    FROM photos p
    LEFT JOIN orders o ON p.order_id = o.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN users up ON o.prestataire_id = up.id
    ORDER BY p.uploaded_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  create,
  findByOrderId,
  deleteById,
  getAllPhotos
};
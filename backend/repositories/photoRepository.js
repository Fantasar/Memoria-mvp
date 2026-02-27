// backend/repositories/photosRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `photos`.
 * Gère les photos avant/après uploadées par les prestataires sur Cloudinary.
 * Ces photos déclenchent le workflow de validation admin qui conditionne
 * le déblocage du paiement vers le prestataire.
 */

/**
 * Enregistre une nouvelle photo en base après upload Cloudinary
 * @param {Object} photoData - { order_id, photo_type, cloudinary_url, cloudinary_public_id }
 * @returns {Object} - La photo créée
 */
const create = async (photoData) => {
  try {
    const result = await pool.query(
      `INSERT INTO photos (order_id, type, url, cloudinary_public_id, uploaded_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, order_id, type, url, cloudinary_public_id, uploaded_at`,
      [
        photoData.order_id,
        photoData.photo_type,
        photoData.cloudinary_url,
        photoData.cloudinary_public_id
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`photosRepository.create : ${error.message}`);
  }
};

/**
 * Récupère toutes les photos d'une commande, triées par date d'upload
 * @param {number} orderId
 * @returns {Array} - [{ id, order_id, type, url, cloudinary_public_id, uploaded_at }, ...]
 */
const findByOrderId = async (orderId) => {
  try {
    const result = await pool.query(
      `SELECT id, order_id, type, url, cloudinary_public_id, uploaded_at
       FROM photos
       WHERE order_id = $1
       ORDER BY uploaded_at DESC`,
      [orderId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`photosRepository.findByOrderId : ${error.message}`);
  }
};

/**
 * Supprime une photo par son ID
 * Note : penser à supprimer également le fichier sur Cloudinary via photoService
 * @param {number} photoId
 * @returns {Object|undefined} - La photo supprimée ou undefined si non trouvée
 */
const deleteById = async (photoId) => {
  try {
    const result = await pool.query(
      `DELETE FROM photos WHERE id = $1
       RETURNING id, order_id, cloudinary_public_id`,
      [photoId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`photosRepository.deleteById : ${error.message}`);
  }
};

/**
 * Récupère toutes les photos avec le contexte complet de leur commande
 * Utilisé par le dashboard admin pour le contrôle qualité des interventions
 * @returns {Array}
 */
const getAllPhotos = async () => {
  try {
    const result = await pool.query(
      `SELECT
     p.id, p.order_id, p.type AS photo_type, p.url,
     p.cloudinary_public_id, p.uploaded_at AS created_at,
     o.status          AS order_status,
     o.price,
     c.name            AS cemetery_name,
     c.city            AS cemetery_city,
     sc.name           AS service_name,
     uc.prenom         AS client_prenom,
     uc.nom            AS client_nom,
     uc.email          AS client_email,
     up.prenom         AS prestataire_prenom,
     up.nom            AS prestataire_nom,
     up.email          AS prestataire_email
   FROM photos p
   LEFT JOIN orders o              ON p.order_id            = o.id
   LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
   LEFT JOIN service_categories sc ON o.service_category_id = sc.id
   LEFT JOIN users uc              ON o.client_id           = uc.id
   LEFT JOIN users up              ON o.prestataire_id      = up.id
   ORDER BY p.uploaded_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`photosRepository.getAllPhotos : ${error.message}`);
  }
};

module.exports = {
  create,
  findByOrderId,
  deleteById,
  getAllPhotos
};
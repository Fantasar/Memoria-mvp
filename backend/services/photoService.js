// backend/services/photoService.js
const photoRepository = require('../repositories/photoRepository');
const orderRepository = require('../repositories/orderRepository');
const cloudinary      = require('../config/cloudinary');

/**
 * Service de gestion des photos.
 * Orchestre l'upload vers Cloudinary et la persistance en base de données.
 * Les photos avant/après uploadées par le prestataire déclenchent
 * le workflow de validation admin qui conditionne le déblocage du paiement.
 */

/**
 * Vérifie qu'un utilisateur a le droit d'accéder aux photos d'une commande
 * Factorisé car utilisé dans uploadPhoto et getOrderPhotos
 * @param {Object} order - La commande
 * @param {number} userId
 * @param {string} userRole - 'client', 'prestataire' ou 'admin'
 */
const checkOrderAccess = (order, userId, userRole) => {
  if (userRole === 'admin') return; // L'admin accède à tout

  if (userRole === 'client' && order.client_id !== userId) {
    const error = new Error('Accès refusé');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  if (userRole === 'prestataire' && order.prestataire_id !== userId) {
    const error = new Error('Vous ne pouvez accéder qu\'aux photos de vos propres missions');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }
};

/**
 * Uploade une photo vers Cloudinary et sauvegarde l'URL en base
 * @param {number} orderId
 * @param {string} photoType - 'before' ou 'after'
 * @param {Buffer} fileBuffer - Contenu binaire du fichier image
 * @param {number} userId
 * @param {string} userRole
 * @returns {Object} - La photo créée en base
 */
const uploadPhoto = async (orderId, photoType, fileBuffer, userId, userRole) => {
  try {
    // Vérifie que la commande existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Vérifie les droits d'accès
    checkOrderAccess(order, userId, userRole);

    // Valide le type de photo
    if (!['before', 'after'].includes(photoType)) {
      const error = new Error('Type de photo invalide — valeurs acceptées : before, after');
      error.code = 'INVALID_PHOTO_TYPE';
      error.statusCode = 400;
      throw error;
    }

    // Upload vers Cloudinary via stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:        `memoria/orders/${orderId}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    // Persiste l'URL et l'ID Cloudinary en base
    const photo = await photoRepository.create({
      order_id:             orderId,
      photo_type:           photoType,
      cloudinary_url:       uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id
    });

    return photo;

  } catch (error) {
    // Rethrow les erreurs métier telles quelles
    if (error.statusCode) throw error;
    // Erreur technique (Cloudinary ou base de données)
    throw new Error(`photoService.uploadPhoto : ${error.message}`);
  }
};

/**
 * Récupère les photos d'une commande
 * Vérifie que l'utilisateur a le droit d'y accéder
 * @param {number} orderId
 * @param {number} userId
 * @param {string} userRole
 * @returns {Array} - [{ id, type, url, uploaded_at }, ...]
 */
const getOrderPhotos = async (orderId, userId, userRole) => {
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    checkOrderAccess(order, userId, userRole);

    return await photoRepository.findByOrderId(orderId);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`photoService.getOrderPhotos : ${error.message}`);
  }
};

/**
 * Récupère toutes les photos avec contexte — usage admin uniquement
 * Utilisé pour le contrôle qualité des interventions dans le dashboard admin
 * @param {string} role
 * @returns {Array}
 */
const getAllPhotos = async (role) => {
  try {
    if (role !== 'admin') {
      const error = new Error('Accès réservé aux administrateurs');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return await photoRepository.getAllPhotos();

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`photoService.getAllPhotos : ${error.message}`);
  }
};

module.exports = {
  uploadPhoto,
  getOrderPhotos,
  getAllPhotos
};
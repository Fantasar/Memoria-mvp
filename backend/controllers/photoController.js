// backend/controllers/photoController.js
const photoService = require('../services/photoService');

/**
 * Contrôleur des photos.
 * Responsabilité : extraire les données de req, appeler photoService, formater res.
 * Les fichiers sont reçus via multer (req.file) en mémoire avant upload Cloudinary.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: fallbackMessage }
  });
};

/**
 * @desc    uploade une photo vers Cloudinary et l'associe à une commande
 * @route   POST /api/photos/upload
 * @access  Prestataire uniquement
 */
const uploadPhoto = async (req, res) => {
  try {
    // Vérifie la présence du fichier avant tout appel au service
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'NO_FILE',
          message: 'Aucun fichier fourni'
        }
      });
    }

    const { order_id, photo_type } = req.body;

    if (!order_id || !photo_type) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_FIELDS',
          message: 'order_id et photo_type sont requis'
        }
      });
    }

    const photo = await photoService.uploadPhoto(
      order_id,
      photo_type,
      req.file.buffer,
      req.user.userId,
      req.user.role
    );

    return res.status(201).json({
      success: true,
      data:    photo,
      message: 'Photo uploadée avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de l\'upload de la photo');
  }
};

/**
 * @desc    Récupère les photos d'une commande spécifique
 * @route   GET /api/photos/order/:orderId
 * @access  Private (client, prestataire ou admin selon la commande)
 */
const getOrderPhotos = async (req, res) => {
  try {
    const photos = await photoService.getOrderPhotos(
      req.params.orderId,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      count:   photos.length,
      data:    photos
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des photos');
  }
};

/**
 * @desc    Récupère toutes les photos avec contexte commande — admin uniquement
 * @route   GET /api/photos
 * @access  Admin uniquement
 */
const getAllPhotos = async (req, res) => {
  try {
    const photos = await photoService.getAllPhotos(req.user.role);

    return res.status(200).json({
      success: true,
      count:   photos.length,
      data:    photos
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des photos');
  }
};

module.exports = {
  uploadPhoto,
  getOrderPhotos,
  getAllPhotos
};
const photoService = require('../services/photoService');

/**
 * @desc    Upload une photo
 * @route   POST /api/photos/upload
 * @access  Private (Prestataire)
 */
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      console.log('❌ Aucun fichier dans req.file');
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Aucun fichier fourni'
        }
      });
    }

    const { order_id, photo_type } = req.body;

    if (!order_id || !photo_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
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
      data: photo,
      message: 'Photo uploadée avec succès'
    });

  } catch (error) {
    console.error('Erreur upload photo:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'upload de la photo'
      }
    });
  }
};

/**
 * @desc    Récupérer les photos d'une commande
 * @route   GET /api/photos/order/:orderId
 * @access  Private
 */
const getOrderPhotos = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const photos = await photoService.getOrderPhotos(
      orderId,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: photos,
      count: photos.length
    });

  } catch (error) {
    console.error('Erreur récupération photos:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des photos'
      }
    });
  }
};

module.exports = {
  uploadPhoto,
  getOrderPhotos
};
const photoRepository = require('../repositories/photoRepository');
const orderRepository = require('../repositories/orderRepository');
const cloudinary = require('../config/cloudinary');

/**
 * Upload photo vers Cloudinary et sauvegarder en DB
 */
const uploadPhoto = async (orderId, photoType, fileBuffer, userId, userRole) => {
  console.log('📸 uploadPhoto appelé avec:', {
    orderId,
    photoType,
    bufferSize: fileBuffer?.length,
    userId,
    userRole
  });

  // 1. Vérifier que la commande existe
  const order = await orderRepository.findById(orderId);
  
  if (!order) {
    const error = new Error('Commande introuvable');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  console.log('✅ Commande trouvée:', order.id);

  // 2. Vérifier permissions
  if (userRole === 'prestataire' && order.prestataire_id !== userId) {
    const error = new Error('Vous ne pouvez uploader des photos que pour vos propres missions');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  console.log('✅ Permissions OK');

  // 3. Valider le type de photo
  const validTypes = ['before', 'after'];
  if (!validTypes.includes(photoType)) {
    const error = new Error('Type de photo invalide (before ou after)');
    error.code = 'INVALID_PHOTO_TYPE';
    error.statusCode = 400;
    throw error;
  }


  // 4. Upload vers Cloudinary
  try {    
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `memoria/orders/${orderId}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary OK:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });

    // 5. Sauvegarder en DB
    const photo = await photoRepository.create({
      order_id: orderId,
      photo_type: photoType,
      cloudinary_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id
    });

    return photo;

  } catch (error) {    
    const err = new Error('Erreur lors de l\'upload de la photo');
    err.code = 'UPLOAD_FAILED';
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  uploadPhoto,
};
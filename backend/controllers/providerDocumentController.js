// backend/controllers/providerDocumentController.js
const cloudinary = require('../config/cloudinary');
const providerDocumentRepository = require('../repositories/providerDocumentRepository');
const streamifier = require('streamifier');

const DOCUMENT_TYPES = ['rib', 'kbis', 'assurance', 'identite', 'autre'];

/**
 * Upload d'un document prestataire vers Cloudinary
 */
const uploadDocument = async (req, res) => {
  try {
    const { type, label } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FILE', message: 'Aucun fichier fourni' }
      });
    }

    if (!DOCUMENT_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TYPE', message: 'Type de document invalide' }
      });
    }

    if (type === 'autre' && !label?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_LABEL', message: 'Veuillez préciser le type de document' }
      });
    }

    // Upload vers Cloudinary dans un dossier dédié
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `memoria/documents/${req.user.userId}`,
          resource_type: 'auto', // accepte PDF + images
          public_id: `${type}_${Date.now()}`,
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const document = await providerDocumentRepository.create(
      req.user.userId,
      type,
      label || null,
      uploadResult.secure_url,
      req.file.originalname
    );

    return res.status(201).json({ success: true, data: document });

  } catch (error) {
    console.error('Erreur uploadDocument:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'upload' }
    });
  }
};

/**
 * Récupère les documents du prestataire connecté
 */
const getMyDocuments = async (req, res) => {
  try {
    const documents = await providerDocumentRepository.findByUserId(req.user.userId);
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Récupère tous les documents pour l'admin
 */
const getAllDocuments = async (req, res) => {
  try {
    const documents = await providerDocumentRepository.findAllWithProvider();
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Supprime un document (prestataire propriétaire uniquement)
 */
const deleteDocument = async (req, res) => {
  try {
    await providerDocumentRepository.deleteOne(req.params.id, req.user.userId);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    await providerDocumentRepository.markAsRead(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await providerDocumentRepository.markAllAsRead();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const countUnread = async (req, res) => {
  try {
    const count = await providerDocumentRepository.countUnread();
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const adminDeleteDocument = async (req, res) => {
  try {
    await providerDocumentRepository.deleteOne(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  deleteDocument,
  markAsRead,
  markAllAsRead,
  countUnread,
  adminDeleteDocument
};
// backend/services/providerDocumentService.js
const cloudinary                  = require('../config/cloudinary');
const providerDocumentRepository  = require('../repositories/providerDocumentRepository');
const streamifier                 = require('streamifier');

/**
 * Service de gestion des documents prestataires.
 * Responsabilité : orchestrer l'upload Cloudinary et les opérations sur les documents.
 * Appelé exclusivement par providerDocumentController.
 */

// Types de documents acceptés par la plateforme
const DOCUMENT_TYPES = ['rib', 'kbis', 'assurance', 'identite', 'autre'];

/**
 * @desc    Upload un document vers Cloudinary et l'enregistre en base
 * @param   {string} userId      - ID du prestataire connecté
 * @param   {string} type        - Type de document (rib, kbis, assurance, identite, autre)
 * @param   {string} label       - Libellé libre (obligatoire si type === 'autre')
 * @param   {Object} file        - Fichier multer ({ buffer, originalname })
 * @returns {Object}             - Le document créé
 * @throws  {Error}              - INVALID_TYPE si le type est inconnu
 */
const uploadDocument = async (userId, type, label, file) => {
  if (!DOCUMENT_TYPES.includes(type)) {
    const error = new Error('Type de document invalide');
    error.code = 'INVALID_TYPE';
    error.statusCode = 400;
    throw error;
  }

  // Upload vers Cloudinary dans un dossier dédié par prestataire
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        `memoria/documents/${userId}`,
        resource_type: 'auto',              // accepte PDF + images
        public_id:     `${type}_${Date.now()}`,
      },
      (error, result) => error ? reject(error) : resolve(result)
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  return await providerDocumentRepository.create(
    userId,
    type,
    label || null,
    uploadResult.secure_url,
    file.originalname
  );
};

/**
 * @desc    Récupère tous les documents du prestataire connecté
 * @param   {string} userId
 * @returns {Array}
 */
const getMyDocuments = async (userId) => {
  return await providerDocumentRepository.findByUserId(userId);
};

/**
 * @desc    Récupère tous les documents pour le dashboard admin (avec infos prestataire)
 * @returns {Array}
 */
const getAllDocuments = async () => {
  return await providerDocumentRepository.findAllWithProvider();
};

/**
 * @desc    Supprime un document — vérifie que le prestataire en est le propriétaire
 * @param   {number} documentId
 * @param   {string} userId
 * @returns {void}
 */
const deleteDocument = async (documentId, userId) => {
  await providerDocumentRepository.deleteOne(documentId, userId);
};

/**
 * @desc    Supprime un document sans vérification de propriétaire (usage admin)
 * @param   {number} documentId
 * @returns {void}
 */
const adminDeleteDocument = async (documentId) => {
  await providerDocumentRepository.adminDeleteOne(documentId);
};

/**
 * @desc    Marque un document spécifique comme lu (admin)
 * @param   {number} documentId
 * @returns {void}
 */
const markAsRead = async (documentId) => {
  await providerDocumentRepository.markAsRead(documentId);
};

/**
 * @desc    Marque tous les documents comme lus (admin)
 * @returns {void}
 */
const markAllAsRead = async () => {
  await providerDocumentRepository.markAllAsRead();
};

/**
 * @desc    Compte les documents non lus (admin)
 * @returns {number}
 */
const countUnread = async () => {
  return await providerDocumentRepository.countUnread();
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  deleteDocument,
  adminDeleteDocument,
  markAsRead,
  markAllAsRead,
  countUnread
};
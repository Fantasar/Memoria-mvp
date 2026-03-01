// backend/controllers/providerDocumentController.js
const providerDocumentService = require('../services/providerDocumentService');

/**
 * Contrôleur des documents prestataires.
 * Responsabilité : valider les champs, appeler providerDocumentService, formater la réponse.
 */

/**
 * @desc    Upload un document prestataire vers Cloudinary
 * @route   POST /api/provider/documents
 * @access  Prestataire uniquement
 */
const uploadDocument = async (req, res) => {
  try {
    const { type, label } = req.body;

    // Validation du fichier
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FILE', message: 'Aucun fichier fourni' }
      });
    }

    // Validation du type de document
    if (!type) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TYPE', message: 'Type de document requis' }
      });
    }

    // Le libellé est obligatoire pour le type "autre"
    if (type === 'autre' && !label?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_LABEL', message: 'Veuillez préciser le type de document' }
      });
    }

    const document = await providerDocumentService.uploadDocument(
      req.user.userId,
      type,
      label,
      req.file
    );

    return res.status(201).json({ success: true, data: document });

  } catch (error) {
    if (error.code === 'INVALID_TYPE') {
      return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
    }
    console.error('Erreur uploadDocument:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'upload' }
    });
  }
};

/**
 * @desc    Récupère les documents du prestataire connecté
 * @route   GET /api/provider/documents
 * @access  Prestataire uniquement
 */
const getMyDocuments = async (req, res) => {
  try {
    const documents = await providerDocumentService.getMyDocuments(req.user.userId);
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * @desc    Récupère tous les documents pour le dashboard admin
 * @route   GET /api/admin/documents
 * @access  Admin uniquement
 */
const getAllDocuments = async (req, res) => {
  try {
    const documents = await providerDocumentService.getAllDocuments();
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * @desc    Supprime un document — prestataire propriétaire uniquement
 * @route   DELETE /api/provider/documents/:id
 * @access  Prestataire uniquement
 */
const deleteDocument = async (req, res) => {
  try {
    await providerDocumentService.deleteDocument(req.params.id, req.user.userId);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * @desc    Supprime un document sans restriction de propriétaire
 * @route   DELETE /api/admin/documents/:id
 * @access  Admin uniquement
 */
const adminDeleteDocument = async (req, res) => {
  try {
    await providerDocumentService.adminDeleteDocument(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * @desc    Marque un document spécifique comme lu
 * @route   PATCH /api/admin/documents/:id/read
 * @access  Admin uniquement
 */
const markAsRead = async (req, res) => {
  try {
    await providerDocumentService.markAsRead(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Marque tous les documents comme lus
 * @route   PATCH /api/admin/documents/read-all
 * @access  Admin uniquement
 */
const markAllAsRead = async (req, res) => {
  try {
    await providerDocumentService.markAllAsRead();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Retourne le nombre de documents non lus
 * @route   GET /api/admin/documents/unread-count
 * @access  Admin uniquement
 */
const countUnread = async (req, res) => {
  try {
    const count = await providerDocumentService.countUnread();
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
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
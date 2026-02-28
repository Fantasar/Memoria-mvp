// backend/routes/providerDocuments.js
const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');
const {
  uploadDocument, getMyDocuments, getAllDocuments,
  deleteDocument, markAsRead, markAllAsRead, countUnread, adminDeleteDocument
} = require('../controllers/providerDocumentController');

/**
 * Routes des documents prestataires
 * Base : /api/documents
 * Les fichiers transitent en mémoire via multer avant upload vers Cloudinary
 * Deux niveaux d'accès : routes prestataire (propriétaire uniquement) et routes admin
 */

// Configuration multer — stockage en mémoire tampon, 10 Mo max par fichier
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }
});

// ── Routes prestataire ────────────────────────────────────────────────────────

// POST   /api/documents            — Upload un document vers Cloudinary
// Chaîne : authenticateToken → multer (mémoire) → controller → Cloudinary
router.post('/',      authenticateToken, upload.single('file'), uploadDocument);

// GET    /api/documents/me         — Récupère les documents du prestataire connecté
router.get('/me',     authenticateToken, getMyDocuments);

// DELETE /api/documents/:id        — Supprime un document (propriétaire uniquement)
router.delete('/:id', authenticateToken, deleteDocument);

// ── Routes admin ──────────────────────────────────────────────────────────────

// GET    /api/documents/admin           — Récupère tous les documents avec infos prestataire
router.get('/admin',        authenticateToken, authenticateAdmin, getAllDocuments);

// GET    /api/documents/admin/unread    — Nombre de documents non lus
router.get('/admin/unread', authenticateToken, authenticateAdmin, countUnread);

// PATCH  /api/documents/admin/all      — Marque tous les documents comme lus
router.patch('/admin/all',  authenticateToken, authenticateAdmin, markAllAsRead);

// PATCH  /api/documents/admin/:id      — Marque un document spécifique comme lu
router.patch('/admin/:id',  authenticateToken, authenticateAdmin, markAsRead);

// DELETE /api/documents/admin/:id      — Supprime un document sans restriction de propriétaire
router.delete('/admin/:id', authenticateToken, authenticateAdmin, adminDeleteDocument);

module.exports = router;
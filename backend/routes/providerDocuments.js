// backend/routes/providerDocuments.js
const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');
const {
  uploadDocument, getMyDocuments, getAllDocuments,
  deleteDocument, markAsRead, markAllAsRead, countUnread, adminDeleteDocument
} = require('../controllers/providerDocumentController');

// Multer en mémoire — fichiers de 10Mo max
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }
});

// Routes prestataire
router.post('/',      authenticateToken, upload.single('file'), uploadDocument);
router.get('/me',     authenticateToken, getMyDocuments);
router.delete('/:id', authenticateToken, deleteDocument);

// Routes admin
router.get('/admin',        authenticateToken, authenticateAdmin, getAllDocuments);
router.get('/admin/unread', authenticateToken, authenticateAdmin, countUnread);
router.patch('/admin/all',  authenticateToken, authenticateAdmin, markAllAsRead);
router.patch('/admin/:id',  authenticateToken, authenticateAdmin, markAsRead);
router.delete('/admin/:id', authenticateToken, authenticateAdmin, adminDeleteDocument);

module.exports = router;
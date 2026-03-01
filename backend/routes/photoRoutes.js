// backend/routes/photoRoutes.js
const express          = require('express');
const router           = require('express').Router();
const multer           = require('multer');
const photoController  = require('../controllers/photoController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des photos
 * Base : /api/photos
 * Les fichiers transitent en mémoire via multer avant upload vers Cloudinary
 */

// Configuration multer — stockage en mémoire tampon avant envoi à Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    // Rejette tout fichier qui n'est pas une image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'), false);
    }
  }
});

// POST /api/photos/upload          — Upload une photo vers Cloudinary (prestataire)
// Chaîne : authenticateToken → multer → controller
router.post('/upload',authenticateToken, upload.single('photo'), photoController.uploadPhoto);

// GET  /api/photos/order/:orderId  — Photos d'une commande spécifique
router.get('/order/:orderId', authenticateToken, photoController.getOrderPhotos);

// GET  /api/photos                 — Toutes les photos avec contexte (admin uniquement)
router.get('/', authenticateToken, authenticateAdmin, photoController.getAllPhotos);

module.exports = router;
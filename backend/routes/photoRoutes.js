const express = require('express');
const router = express.Router();
const multer = require('multer');
const photoController = require('../controllers/photoController');
const { authenticateToken } = require('../middlewares/auth');

// Configuration Multer (mémoire temporaire)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter seulement images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'), false);
    }
  }
});

// POST : Upload photo
router.post(
  '/upload',
  authenticateToken,
  upload.single('photo'),
  photoController.uploadPhoto
);

// GET : Photos d'une commande
router.get(
  '/order/:orderId',
  authenticateToken,
  photoController.getOrderPhotos
);

module.exports = router;
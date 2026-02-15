const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middlewares/admin-auth');

// GET : Statistiques prestataire
router.get('/provider', authenticateToken, statsController.getProviderStats);

// GET : Statistiques plateforme (admin only)
router.get('/', authenticateToken, statsController.getPlatformStats);

module.exports = router;
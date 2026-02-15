const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET : Statistiques plateforme (admin only)
router.get('/', authenticateToken, statsController.getPlatformStats);

module.exports = router;
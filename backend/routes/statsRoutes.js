// backend/routes/statsRoutes.js
const express          = require('express');
const router           = express.Router();
const statsController  = require('../controllers/statsController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des statistiques
 * Base : /api/stats
 */

// GET /api/stats/provider — Statistiques individuelles du prestataire connecté
router.get('/provider', authenticateToken, statsController.getProviderStats);

// GET /api/stats — Statistiques globales de la plateforme (admin uniquement)
router.get('/', authenticateToken, authenticateAdmin, statsController.getPlatformStats);

module.exports = router;
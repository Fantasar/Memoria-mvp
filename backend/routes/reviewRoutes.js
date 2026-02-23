// backend/routes/reviewRoutes.js
const express           = require('express');
const router            = express.Router();
const reviewController  = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/admin-auth');

/**
 * Routes des avis et notations
 * Base : /api/reviews
 */

// POST /api/reviews                    — Crée un avis après une mission terminée (client uniquement)
router.post('/', authenticateToken, reviewController.createReview);

// GET  /api/reviews/provider           — Avis du prestataire connecté
router.get('/provider', authenticateToken, reviewController.getProviderReviews);

// GET  /api/reviews/provider/:id       — Avis d'un prestataire spécifique (admin ou client)
router.get('/provider/:id', authenticateToken, reviewController.getProviderReviews);

module.exports = router;
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/admin-auth');

// Créer une évaluation (client)
router.post('/', authenticateToken, reviewController.createReview);

// Récupérer les évaluations du prestataire connecté
router.get('/provider', authenticateToken, reviewController.getProviderReviews);

module.exports = router;
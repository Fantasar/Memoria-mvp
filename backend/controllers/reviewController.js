// backend/controllers/reviewController.js
const reviewService = require('../services/reviewService');

/**
 * Contrôleur des avis et notations.
 * Responsabilité : extraire les données de req, appeler reviewService, formater res.
 * Utilise next(error) pour déléguer la gestion d'erreur au middleware Express global.
 */

/**
 * @desc    Crée un avis après une intervention terminée
 * @route   POST /api/reviews
 * @access  Client uniquement
 */
const createReview = async (req, res, next) => {
  try {
    const { order_id, rating, comment } = req.body;

    const review = await reviewService.createReview(
      req.user.userId,
      order_id,
      rating,
      comment
    );

    return res.status(201).json({
      success: true,
      data:    review,
      message: 'Évaluation créée avec succès'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupère les avis et la note moyenne d'un prestataire
 * @route   GET /api/reviews/provider/:id
 * @access  Private
 */
const getProviderReviews = async (req, res, next) => {
  try {
    // Utilise l'id depuis les params pour permettre la consultation
    // de n'importe quel prestataire (admin, client, ou le prestataire lui-même)
    const prestataireId = parseInt(req.params.id) || req.user.userId;

    const data = await reviewService.getProviderReviews(prestataireId);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews
};
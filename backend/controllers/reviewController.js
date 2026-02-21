const reviewService = require('../services/reviewService');

/**
 * Créer une évaluation
 */
const createReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { order_id, rating, comment } = req.body;

    const review = await reviewService.createReview(userId, order_id, rating, comment);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Évaluation créée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les évaluations d'un prestataire
 */
const getProviderReviews = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const data = await reviewService.getProviderReviews(userId);

    res.status(200).json({
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
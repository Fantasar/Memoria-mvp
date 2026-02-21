const reviewRepository = require('../repositories/reviewRepository');
const orderRepository = require('../repositories/orderRepository');
const userRepository = require('../repositories/userRepository');

/**
 * Créer une évaluation (client uniquement)
 */
const createReview = async (userId, orderId, rating, comment) => {
  // 1. Vérifier que c'est un client
  const user = await userRepository.findById(userId);
  
  if (!user || user.role !== 'client') {
    const error = new Error('Seuls les clients peuvent laisser des évaluations');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // 2. Vérifier que la commande existe
  const order = await orderRepository.findById(orderId);
  
  if (!order) {
    const error = new Error('Commande introuvable');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // 3. Vérifier que c'est bien la commande du client
  if (order.client_id !== userId) {
    const error = new Error('Cette commande ne vous appartient pas');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // 4. Vérifier que la commande est terminée
  if (order.status !== 'completed') {
    const error = new Error('Vous ne pouvez évaluer que les missions terminées');
    error.code = 'ORDER_NOT_COMPLETED';
    error.statusCode = 400;
    throw error;
  }

  // 5. Vérifier qu'il n'y a pas déjà une évaluation
  const alreadyReviewed = await reviewRepository.existsByOrderId(orderId);
  
  if (alreadyReviewed) {
    const error = new Error('Vous avez déjà évalué cette mission');
    error.code = 'ALREADY_REVIEWED';
    error.statusCode = 409;
    throw error;
  }

  // 6. Validation de la note
  if (!rating || rating < 1 || rating > 5) {
    const error = new Error('La note doit être entre 1 et 5');
    error.code = 'INVALID_RATING';
    error.statusCode = 400;
    throw error;
  }

  // 7. Créer l'évaluation
  const review = await reviewRepository.create({
    order_id: orderId,
    client_id: userId,
    prestataire_id: order.prestataire_id,
    rating,
    comment: comment || null
  });

  return review;
};

/**
 * Récupérer les évaluations d'un prestataire
 */
const getProviderReviews = async (prestatairId) => {
  const user = await userRepository.findById(prestatairId);
  
  if (!user || user.role !== 'prestataire') {
    const error = new Error('Prestataire introuvable');
    error.code = 'NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const reviews = await reviewRepository.findByPrestataire(prestatairId);
  const stats = await reviewRepository.getAverageRating(prestatairId);

  return {
    reviews,
    average_rating: stats.average_rating,
    total_reviews: stats.total_reviews
  };
};

module.exports = {
  createReview,
  getProviderReviews
};
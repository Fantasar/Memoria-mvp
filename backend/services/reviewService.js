// backend/services/reviewService.js
const reviewRepository = require('../repositories/reviewRepository');
const orderRepository  = require('../repositories/orderRepository');
const userRepository   = require('../repositories/userRepository');

/**
 * Service de gestion des avis et notations.
 * Garantit l'intégrité du système de réputation :
 * - Seul un client peut noter
 * - Uniquement sa propre commande
 * - Uniquement si la commande est au statut 'completed'
 * - Un seul avis par commande
 */

/**
 * Crée un avis après validation de toutes les règles métier
 * @param {number} userId - ID du client connecté
 * @param {number} orderId
 * @param {number} rating - Note entre 1 et 5
 * @param {string} comment - Commentaire optionnel
 * @returns {Object} - L'avis créé
 */
const createReview = async (userId, orderId, rating, comment) => {
  try {
    // Valide la note en premier — vérification légère avant les appels BDD
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('La note doit être entre 1 et 5');
      error.code = 'INVALID_RATING';
      error.statusCode = 400;
      throw error;
    }

    // Vérifie que le rôle est bien 'client'
    // (double sécurité — le middleware vérifie déjà l'authentification)
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'client') {
      const error = new Error('Seuls les clients peuvent laisser des évaluations');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Vérifie que la commande existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Vérifie que la commande appartient bien à ce client
    if (order.client_id !== userId) {
      const error = new Error('Cette commande ne vous appartient pas');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Vérifie que la commande est bien terminée et validée
    if (order.status !== 'completed') {
      const error = new Error('Vous ne pouvez évaluer que les missions terminées');
      error.code = 'ORDER_NOT_COMPLETED';
      error.statusCode = 400;
      throw error;
    }

    // Vérifie qu'aucun avis n'a déjà été soumis pour cette commande
    const alreadyReviewed = await reviewRepository.existsByOrderId(orderId);
    if (alreadyReviewed) {
      const error = new Error('Vous avez déjà évalué cette mission');
      error.code = 'ALREADY_REVIEWED';
      error.statusCode = 409;
      throw error;
    }

    return await reviewRepository.create({
      order_id:       orderId,
      client_id:      userId,
      prestataire_id: order.prestataire_id,
      rating,
      comment:        comment || null
    });

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`reviewService.createReview : ${error.message}`);
  }
};

/**
 * Récupère les avis et la note moyenne d'un prestataire
 * Les deux requêtes sont indépendantes, exécutées en parallèle
 * @param {number} prestataireId
 * @returns {Object} - { reviews, average_rating, total_reviews }
 */
const getProviderReviews = async (prestataireId) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Prestataire introuvable');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // reviews et stats sont indépendants — exécution parallèle
    const [reviews, stats] = await Promise.all([
      reviewRepository.findByPrestataire(prestataireId),
      reviewRepository.getAverageRating(prestataireId)
    ]);

    return {
      reviews,
      average_rating: stats.average_rating,
      total_reviews:  stats.total_reviews
    };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`reviewService.getProviderReviews : ${error.message}`);
  }
};

module.exports = {
  createReview,
  getProviderReviews
};
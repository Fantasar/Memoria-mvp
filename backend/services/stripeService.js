// backend/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Service d'intégration Stripe.
 * Encapsule les appels à l'API Stripe pour la gestion des paiements.
 * Aucune logique métier ici — uniquement la communication avec Stripe.
 *
 * Les montants reçus sont en euros et convertis en centimes avant envoi à Stripe
 * (Stripe exige des entiers en centimes : 29.90€ → 2990 centimes)
 */

/**
 * Crée un PaymentIntent Stripe pour initier un paiement
 * Retourne le client_secret utilisé par le frontend pour confirmer le paiement
 * @param {number} amount - Montant en euros (ex: 29.90)
 * @param {Object} metadata - Données associées au paiement (order_id, client_id, etc.)
 * @returns {Object} - PaymentIntent Stripe avec client_secret
 */
const createPaymentIntent = async (amount, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // Conversion euros → centimes
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata
    });

    return paymentIntent;

  } catch (error) {
    throw new Error(`stripeService.createPaymentIntent : ${error.message}`);
  }
};

/**
 * Récupère un PaymentIntent existant par son ID Stripe
 * Utilisé pour vérifier le statut d'un paiement (succeeded, pending, failed)
 * @param {string} paymentIntentId - ex: 'pi_3OqX...'
 * @returns {Object} - PaymentIntent Stripe
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    throw new Error(`stripeService.retrievePaymentIntent : ${error.message}`);
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent
};
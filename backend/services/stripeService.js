// backend/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * SERVICE STRIPE
 * Responsabilité : Gestion des paiements Stripe
 */

/**
 * Créer un Payment Intent Stripe
 * @param {number} amount - Montant en euros (sera converti en centimes)
 * @param {object} metadata - Métadonnées (cemetery_id, service_category_id, etc.)
 * @returns {object} Payment Intent avec client_secret
 */
const createPaymentIntent = async (amount, metadata) => {
  try {
    // Stripe attend le montant en centimes
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Erreur Stripe createPaymentIntent:', error);
    throw error;
  }
};

/**
 * Récupérer un Payment Intent par son ID
 * @param {string} paymentIntentId
 * @returns {object} Payment Intent
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur Stripe retrievePaymentIntent:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
};
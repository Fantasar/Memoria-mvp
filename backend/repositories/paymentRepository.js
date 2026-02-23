// backend/repositories/paymentRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `payments`.
 * Trace tous les mouvements financiers : paiements clients et transferts prestataires.
 * La logique Stripe (création de PaymentIntent, transfert) reste dans paymentService —
 * ce repository ne fait que persister et lire les enregistrements de paiement.
 */

/**
 * Crée un enregistrement de paiement
 * Appelé après chaque opération Stripe réussie pour tracer le mouvement
 * @param {Object} paymentData - { order_id, amount, stripe_payment_intent_id,
 *                                 stripe_transfer_id, status, payment_type, recipient_id }
 * @returns {Object} - Le paiement créé
 */
const create = async (paymentData) => {
  try {
    const result = await pool.query(
      `INSERT INTO payments (
         order_id, amount,
         stripe_payment_intent_id, stripe_transfer_id,
         status, payment_type,
         recipient_id, released_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, order_id, amount, status, payment_type,
                 stripe_payment_intent_id, recipient_id, released_at`,
      [
        paymentData.order_id,
        paymentData.amount,
        paymentData.stripe_payment_intent_id || null,
        paymentData.stripe_transfer_id       || null,
        paymentData.status                   || 'pending',
        paymentData.payment_type,
        paymentData.recipient_id             || null
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`paymentRepository.create : ${error.message}`);
  }
};

/**
 * Récupère tous les paiements associés à une commande
 * Permet de voir l'historique complet : paiement client + transfert prestataire
 * @param {number} orderId
 * @returns {Array}
 */
const findByOrderId = async (orderId) => {
  try {
    const result = await pool.query(
      `SELECT id, order_id, amount, status, payment_type,
              stripe_payment_intent_id, stripe_transfer_id,
              recipient_id, released_at, created_at
       FROM payments
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [orderId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`paymentRepository.findByOrderId : ${error.message}`);
  }
};

/**
 * Récupère un paiement par son identifiant Stripe
 * Utilisé lors de la réception des webhooks Stripe pour retrouver
 * le paiement correspondant à un événement Stripe
 * @param {string} stripePaymentIntentId - ex: 'pi_3OqX...'
 * @returns {Object|undefined}
 */
const findByStripeId = async (stripePaymentIntentId) => {
  try {
    const result = await pool.query(
      `SELECT id, order_id, amount, status, payment_type,
              stripe_payment_intent_id, recipient_id, released_at
       FROM payments
       WHERE stripe_payment_intent_id = $1`,
      [stripePaymentIntentId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`paymentRepository.findByStripeId : ${error.message}`);
  }
};

module.exports = {
  create,
  findByOrderId,
  findByStripeId
};
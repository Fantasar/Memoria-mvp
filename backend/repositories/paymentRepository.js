const pool = require('../config/db');

/**
 * Créer un enregistrement de paiement
 */
const create = async (paymentData) => {
  const query = `
    INSERT INTO payments (
      order_id,
      amount,
      stripe_payment_intent_id,
      stripe_transfer_id,
      status,
      payment_type,
      recipient_id,
      released_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  
  const values = [
    paymentData.order_id,
    paymentData.amount,
    paymentData.stripe_payment_intent_id || null,
    paymentData.stripe_transfer_id || null,
    paymentData.status || 'pending',
    paymentData.payment_type,
    paymentData.recipient_id || null
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Récupérer les paiements d'une commande
 */
const findByOrderId = async (orderId) => {
  const query = `
    SELECT * FROM payments
    WHERE order_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [orderId]);
  return result.rows;
};

module.exports = {
  create,
  findByOrderId
};
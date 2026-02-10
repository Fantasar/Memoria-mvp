// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/admin-auth');
const paymentController = require('../controllers/paymentController');

/**
 * @route   POST /api/payments/create-payment-intent
 * @desc    Créer un Payment Intent Stripe
 * @access  Private (Client uniquement)
 */
router.post('/create-payment-intent', authenticateToken, paymentController.createPaymentIntent);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirmer le paiement et créer la commande
 * @access  Private (Client uniquement)
 */
router.post('/confirm', authenticateToken, paymentController.confirmPayment);

module.exports = router;
// backend/routes/payments.js
const express             = require('express');
const router              = express.Router();
const paymentController   = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/admin-auth');

/**
 * Routes des paiements Stripe
 * Base : /api/payments
 * Les deux routes suivent le tunnel de paiement dans l'ordre :
 * 1. create-payment-intent → génère le client_secret pour le frontend
 * 2. confirm              → vérifie le succès Stripe et crée la commande en base
 */

// POST /api/payments/create-payment-intent — Crée un PaymentIntent et retourne le client_secret
router.post('/create-payment-intent', authenticateToken, paymentController.createPaymentIntent);

// POST /api/payments/confirm              — Confirme le paiement et crée la commande
router.post('/confirm', authenticateToken, paymentController.confirmPayment);

module.exports = router;
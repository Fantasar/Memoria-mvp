// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/admin-auth');
const orderController = require('../controllers/orderController');

/**
 * @route   POST /api/orders
 * @desc    Créer une nouvelle commande
 * @access  Private (Client) - JWT REQUIS
 */
router.post('/', authenticateToken, orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Récupérer mes commandes
 * @access  Private (Tous) - JWT REQUIS
 */
router.get('/', authenticateToken, orderController.getMyOrders);

/**
 * @route   GET /api/orders/available
 * @desc    Missions disponibles (prestataires)
 * @access  Private (Prestataire) - JWT REQUIS
 */
router.get('/available', authenticateToken, orderController.getAvailableOrders);

/**
 * @route   PATCH /api/orders/:id/accept
 * @desc    Accepter une mission
 * @access  Private (Prestataire) - JWT REQUIS
 */
router.patch('/:id/accept', authenticateToken, orderController.acceptOrder);

module.exports = router;
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
 * @route   GET /api/orders/available
 * @desc    Missions disponibles (prestataires)
 * @access  Private (Prestataire) - JWT REQUIS
 * 
 * ⚠️ IMPORTANT : Cette route DOIT être AVANT /api/orders/:id
 * sinon Express va confondre "available" avec un ID !
 */
router.get('/available', authenticateToken, orderController.getAvailableOrders);

/**
 * @route   PATCH /api/orders/:id/accept
 * @desc    Accepter une mission
 * @access  Private (Prestataire) - JWT REQUIS
 */
router.patch('/:id/accept', authenticateToken, orderController.acceptOrder);

/**
 * @route   PATCH /api/orders/:id/complete
 * @desc    Compléter mission
 * @access  Private (Prestataire) - JWT REQUIS
 */
router.patch('/:id/complete', authenticateToken, orderController.completeOrder);

/**
 * @route   PATCH /api/orders//:id/cancel
 * @desc    Annuler une mission
 * @access  Private (Prestataire) - JWT REQUIS
 */
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);

/**
 * @route   GET /api/orders//pending-validation
 * @desc    Intervention en attente de validation
 * @access  Private (Admin) - JWT REQUIS
 */
router.get('/pending-validation', authenticateToken, orderController.getPendingValidation);

/**
 * @route   PATCH /api/orders/:id/validate
 * @desc    Valider une intervention
 * @access  Private (admin) - JWT REQUIS
 */
router.patch('/:id/validate', authenticateToken, orderController.validateOrder);

/**
 * @route   GET /api/orders//disputed
 * @desc    Gestion des litiges
 * @access  Private (admin) - JWT REQUIS
 */
router.get('/disputed', authenticateToken, orderController.getDisputedOrders);

/**
 * @route   PATCH /api/orders//:id/dispute'
 * @desc    Marquer comme litigieux
 * @access  Private (admin) - JWT REQUIS
 */
router.patch('/:id/dispute', authenticateToken, orderController.markAsDisputed);

/**
 * @route   PATCH /api/orders/:id/resolve'
 * @desc    Résoudre le litige
 * @access  Private (admin) - JWT REQUIS
 */
router.patch('/:id/resolve', authenticateToken, orderController.resolveDispute);

/**
 * @route   GET /api/orders/:id
 * @desc    Récupérer les détails d'une commande
 * @access  Private (Tous) - JWT REQUIS
 */
router.get('/:id', authenticateToken, orderController.getOrderById);

/**
 * @route   GET /api/orders
 * @desc    Récupérer mes commandes
 * @access  Private (Tous) - JWT REQUIS
 */
router.get('/', authenticateToken, orderController.getMyOrders);

module.exports = router;
// backend/routes/orders.js
const express          = require('express');
const router           = express.Router();
const orderController  = require('../controllers/orderController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des commandes
 * Base : /api/orders
 *
 * ⚠️ ORDRE CRITIQUE : les routes statiques DOIVENT être déclarées
 * avant les routes dynamiques (:id) pour éviter les conflits Express.
 * Ex: /available doit être avant /:id, sinon "available" est lu comme un ID.
 */

// ─── ROUTES STATIQUES (avant toute route avec :id) ────────────────────────────

// GET  /api/orders                    — Commandes de l'utilisateur connecté (tous rôles)
router.get('/', authenticateToken, orderController.getMyOrders);

// GET  /api/orders/available          — Missions disponibles dans la zone (prestataire)
router.get('/available', authenticateToken, orderController.getAvailableOrders);

// GET  /api/orders/pending-validation — Commandes en attente de validation (admin)
router.get('/pending-validation', authenticateToken, authenticateAdmin, orderController.getPendingValidation);

// GET  /api/orders/disputed           — Commandes en litige (admin)
router.get('/disputed', authenticateToken, authenticateAdmin, orderController.getDisputedOrders);

// GET  /api/orders/dashboard-stats    — Statistiques du dashboard client
router.get('/dashboard-stats', authenticateToken, orderController.getDashboardStats);

// GET  /api/orders/history            — Historique des missions terminées (prestataire)
router.get('/history', authenticateToken, orderController.getProviderHistory);

// GET  /api/orders/gallery            — Commandes terminées avec photos (client)
router.get('/gallery', authenticateToken, orderController.getCompletedOrdersWithPhotos);

// GET  /api/orders/calendar           — Calendrier du prestataire connecté
router.get('/calendar', authenticateToken, orderController.getProviderCalendar);

// GET  /api/orders/calendar/:prestataireId — Calendrier d'un prestataire spécifique (admin)
router.get('/calendar/:prestataireId', authenticateToken, authenticateAdmin, orderController.getProviderCalendarForAdmin);

// POST /api/orders                    — Crée une nouvelle commande (client)
router.post('/', authenticateToken, orderController.createOrder);

// ─── ROUTES DYNAMIQUES (avec :id) ─────────────────────────────────────────────

// GET   /api/orders/:id               — Détails d'une commande (tous rôles, filtré par ownership)
router.get('/:id', authenticateToken, orderController.getOrderById);

// PATCH /api/orders/:id/cancel-client — Annule une commande en attente (client)
router.patch('/:id/cancel-client', authenticateToken, orderController.cancelOrderClient);

// PATCH /api/orders/:id/accept        — Accepte une mission avec planning (prestataire)
router.patch('/:id/accept', authenticateToken, orderController.acceptOrder);

// PATCH /api/orders/:id/complete      — Marque une mission comme terminée (prestataire)
router.patch('/:id/complete', authenticateToken, orderController.completeOrder);

// PATCH /api/orders/:id/cancel        — Annule une mission acceptée (prestataire)
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);

// PATCH /api/orders/:id/validate      — Valide une intervention et paie le prestataire (admin)
router.patch('/:id/validate', authenticateToken, authenticateAdmin, orderController.validateOrder);

// PATCH /api/orders/:id/dispute       — Marque une commande comme litigieuse (admin)
router.patch('/:id/dispute', authenticateToken, authenticateAdmin, orderController.markAsDisputed);

// PATCH /api/orders/:id/resolve       — Résout un litige (admin)
router.patch('/:id/resolve', authenticateToken, authenticateAdmin, orderController.resolveDispute);

// PATCH /api/orders/:orderId/report-dispute — Signale un litige côté client
router.patch('/:orderId/report-dispute', authenticateToken, orderController.reportDispute);

module.exports = router;
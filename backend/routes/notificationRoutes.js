// backend/routes/notificationRoutes.js
const express                  = require('express');
const router                   = express.Router();
const notificationController   = require('../controllers/notificationController');
const { authenticateToken }    = require('../middlewares/admin-auth');

/**
 * Routes des notifications
 * Base : /api/notifications
 * Toutes les routes sont privées — un utilisateur ne peut accéder qu'à ses propres notifications
 */

// GET    /api/notifications              — Liste des notifications avec compteur non lus
router.get('/',             authenticateToken, notificationController.getUserNotifications);

// PATCH  /api/notifications/read-all    — Marque toutes les notifications comme lues
// ⚠️ Doit être avant /:id pour ne pas être intercepté comme un paramètre
router.patch('/read-all',   authenticateToken, notificationController.markAllAsRead);

// PATCH  /api/notifications/:id/read   — Marque une notification spécifique comme lue
router.patch('/:id/read',   authenticateToken, notificationController.markAsRead);

// DELETE /api/notifications/:id        — Supprime une notification
router.delete('/:id',       authenticateToken, notificationController.deleteNotification);

module.exports = router;
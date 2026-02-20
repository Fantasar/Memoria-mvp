const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/admin-auth');

// GET /api/notifications - Récupérer les notifications
router.get('/', authenticateToken, notificationController.getUserNotifications);

// PATCH /api/notifications/:id/read - Marquer comme lue
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

// PATCH /api/notifications/read-all - Marquer toutes comme lues
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

module.exports = router;
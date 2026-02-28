// backend/controllers/notificationController.js
const notificationService = require('../services/notificationService');

/**
 * Contrôleur des notifications.
 * Responsabilité : extraire les données de req, appeler notificationService, formater res.
 * Utilise next(error) pour déléguer la gestion d'erreur au middleware Express global.
 */

/**
 * @desc    Récupère les notifications de l'utilisateur connecté avec compteur non lus
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = async (req, res, next) => {
  try {
    console.log('🔍 req.user:', req.user); // ← ajoute ça

    const data = await notificationService.getUserNotifications(req.user.userId);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Marque une notification spécifique comme lue
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationAsRead(
      parseInt(req.params.id),
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data:    notification
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Marque toutes les notifications comme lues
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const notifications = await notificationService.markAllAsRead(req.user.userId);

    return res.status(200).json({
      success: true,
      data:    notifications
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprime une notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      parseInt(req.params.id),
      req.user.userId
    );

    return res.status(200).json({
      success:  true,
      message: 'Notification supprimée'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
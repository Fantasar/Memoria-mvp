const notificationService = require('../services/notificationService');

/**
 * Récupérer les notifications de l'utilisateur
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = await notificationService.getUserNotifications(userId);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await notificationService.markNotificationAsRead(parseInt(id), userId);
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await notificationService.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await notificationService.deleteNotification(parseInt(id), userId);
    
    res.status(200).json({
      success: true,
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
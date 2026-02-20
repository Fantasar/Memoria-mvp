const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

/**
 * Créer une notification
 */
const createNotification = async (notificationData) => {
  return await notificationRepository.create(notificationData);
};

/**
 * Récupérer les notifications d'un utilisateur
 */
const getUserNotifications = async (userId) => {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  
  const notifications = await notificationRepository.findByUserId(userId);
  const unreadCount = await notificationRepository.countUnread(userId);
  
  return {
    notifications,
    unread_count: unreadCount
  };
};

/**
 * Marquer une notification comme lue
 */
const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.markAsRead(notificationId, userId);
  
  if (!notification) {
    const error = new Error('Notification introuvable');
    error.code = 'NOTIFICATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  
  return notification;
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await notificationRepository.deleteById(notificationId, userId);
  
  if (!notification) {
    const error = new Error('Notification introuvable');
    error.code = 'NOTIFICATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  
  return notification;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};
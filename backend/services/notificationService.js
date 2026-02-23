// backend/services/notificationService.js
const notificationRepository = require('../repositories/notificationRepository');
const userRepository         = require('../repositories/userRepository');

/**
 * Service de gestion des notifications.
 * Orchestre les notifications pour les trois rôles de la plateforme.
 * Garantit qu'un utilisateur ne peut accéder qu'à ses propres notifications.
 * Utilisé par tous les dashboards pour le badge de compteur non lu.
 */

/**
 * Crée une notification pour un utilisateur
 * Appelé par les autres services lors des étapes clés du workflow
 * (commande acceptée, intervention terminée, litige ouvert, etc.)
 * @param {Object} notificationData - { user_id, type, title, message, order_id }
 * @returns {Object} - La notification créée
 */
const createNotification = async (notificationData) => {
  try {
    return await notificationRepository.create(notificationData);
  } catch (error) {
    throw new Error(`notificationService.createNotification : ${error.message}`);
  }
};

/**
 * Récupère les notifications d'un utilisateur avec le compteur de non-lus
 * Les deux requêtes sont indépendantes, exécutées en parallèle
 * @param {number} userId
 * @returns {Object} - { notifications, unread_count }
 */
const getUserNotifications = async (userId) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Utilisateur introuvable');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // notifications et unread_count sont indépendants — exécution parallèle
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUserId(userId),
      notificationRepository.countUnread(userId)
    ]);

    return {
      notifications,
      unread_count: unreadCount
    };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`notificationService.getUserNotifications : ${error.message}`);
  }
};

/**
 * Marque une notification spécifique comme lue
 * Le repository vérifie que la notification appartient bien à cet utilisateur
 * @param {number} notificationId
 * @param {number} userId
 * @returns {Object} - La notification mise à jour
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await notificationRepository.markAsRead(notificationId, userId);

    if (!notification) {
      const error = new Error('Notification introuvable');
      error.code = 'NOTIFICATION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return notification;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`notificationService.markNotificationAsRead : ${error.message}`);
  }
};

/**
 * Marque toutes les notifications non lues d'un utilisateur comme lues
 * Appelé via le bouton "Tout marquer comme lu" dans le dashboard
 * @param {number} userId
 * @returns {Array} - Les notifications mises à jour
 */
const markAllAsRead = async (userId) => {
  try {
    return await notificationRepository.markAllAsRead(userId);
  } catch (error) {
    throw new Error(`notificationService.markAllAsRead : ${error.message}`);
  }
};

/**
 * Supprime une notification
 * Le repository vérifie que la notification appartient bien à cet utilisateur
 * @param {number} notificationId
 * @param {number} userId
 * @returns {Object} - La notification supprimée
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await notificationRepository.deleteById(notificationId, userId);

    if (!notification) {
      const error = new Error('Notification introuvable');
      error.code = 'NOTIFICATION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return notification;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`notificationService.deleteNotification : ${error.message}`);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};
// backend/repositories/notificationRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `notifications`.
 * Gère les notifications envoyées aux utilisateurs lors des étapes clés du workflow :
 * commande acceptée, intervention terminée, validation admin, litige ouvert, etc.
 * Alimente le badge de compteur non lu affiché dans la navbar de chaque dashboard.
 */

/**
 * Crée une nouvelle notification pour un utilisateur
 * @param {Object} notificationData - { user_id, type, title, message, order_id }
 * @returns {Object} - La notification créée
 */
const create = async (notificationData) => {
  const { user_id, type, title, message, order_id } = notificationData;
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, order_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, type, title, message, order_id, is_read, created_at`,
      [user_id, type, title, message, order_id || null]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`notificationRepository.create : ${error.message}`);
  }
};

/**
 * Récupère les notifications d'un utilisateur avec le contexte de la commande associée
 * Limitées à 50 par défaut pour éviter de surcharger le frontend
 * @param {number} userId
 * @param {number} limit - Nombre maximum de notifications à retourner (défaut : 50)
 * @returns {Array}
 */
const findByUserId = async (userId, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT
         n.id, n.user_id, n.type, n.title,
         n.message, n.is_read, n.created_at,
         n.order_id,
         o.price,
         c.name  AS cemetery_name,
         sc.name AS service_name
       FROM notifications n
       LEFT JOIN orders o              ON n.order_id            = o.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`notificationRepository.findByUserId : ${error.message}`);
  }
};

/**
 * Compte les notifications non lues d'un utilisateur
 * Utilisé pour afficher le badge de compteur dans la navbar
 * @param {number} userId
 * @returns {number}
 */
const countUnread = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    throw new Error(`notificationRepository.countUnread : ${error.message}`);
  }
};

/**
 * Marque une notification spécifique comme lue
 * La condition AND user_id = $2 empêche un utilisateur de lire les notifs d'un autre
 * @param {number} notificationId
 * @param {number} userId
 * @returns {Object|undefined} - undefined si la notification n'appartient pas à cet utilisateur
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, is_read`,
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`notificationRepository.markAsRead : ${error.message}`);
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
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING id, user_id, is_read`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`notificationRepository.markAllAsRead : ${error.message}`);
  }
};

/**
 * Supprime une notification
 * La condition AND user_id = $2 empêche la suppression des notifs d'un autre utilisateur
 * @param {number} notificationId
 * @param {number} userId
 * @returns {Object|undefined}
 */
const deleteById = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`notificationRepository.deleteById : ${error.message}`);
  }
};

module.exports = {
  create,
  findByUserId,
  countUnread,
  markAsRead,
  markAllAsRead,
  deleteById
};
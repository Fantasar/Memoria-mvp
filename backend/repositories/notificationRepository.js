const pool = require('../config/db');

/**
 * Créer une notification
 */
async function create(notificationData) {
  const { user_id, type, title, message, order_id } = notificationData;
  
  const query = `
    INSERT INTO notifications (user_id, type, title, message, order_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [user_id, type, title, message, order_id || null]);
  return result.rows[0];
}

/**
 * Récupérer les notifications d'un utilisateur
 */
async function findByUserId(userId, limit = 50) {
  const query = `
    SELECT 
      n.*,
      o.cemetery_name,
      o.service_name,
      o.price
    FROM notifications n
    LEFT JOIN orders o ON n.order_id = o.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

/**
 * Compter les notifications non lues
 */
async function countUnread(userId) {
  const query = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND is_read = FALSE
  `;
  
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
}

/**
 * Marquer une notification comme lue
 */
async function markAsRead(notificationId, userId) {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
}

/**
 * Marquer toutes les notifications comme lues
 */
async function markAllAsRead(userId) {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
    RETURNING *
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Supprimer une notification
 */
async function deleteById(notificationId, userId) {
  const query = `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
}

module.exports = {
  create,
  findByUserId,
  countUnread,
  markAsRead,
  markAllAsRead,
  deleteById
};
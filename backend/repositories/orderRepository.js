// backend/repositories/orderRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `orders`.
 * Gère l'intégralité du cycle de vie d'une commande :
 * création → assignation → réalisation → validation → paiement.
 * C'est le repository le plus sollicité de l'application.
 */

// Colonnes communes aux requêtes de lecture avec jointures
const ORDER_SELECT_BASE = `
  SELECT
    o.*,
    c.name  AS cemetery_name,
    c.city  AS cemetery_city,
    sc.name AS service_name
  FROM orders o
  LEFT JOIN cemeteries c         ON o.cemetery_id          = c.id
  LEFT JOIN service_categories sc ON o.service_category_id = sc.id
`;

/**
 * Crée une nouvelle commande
 * @param {Object} orderData - { client_id, cemetery_id, service_category_id, price, ... }
 * @returns {Object} - La commande créée
 */
const create = async (orderData) => {
  try {
    const result = await pool.query(
      `INSERT INTO orders (
     client_id, prestataire_id, cemetery_id,
     service_category_id, cemetery_location,
     comment, status, price, created_at
   )
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
   RETURNING *`,
      [
        orderData.client_id,
        orderData.prestataire_id || null,
        orderData.cemetery_id,
        orderData.service_category_id,
        orderData.cemetery_location || null,
        orderData.comment || null,
        orderData.status || 'pending',
        orderData.price
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.create : ${error.message}`);
  }
};

/**
 * Récupère une commande par son ID avec tous les détails (client, prestataire, cimetière, service)
 * @param {number} orderId
 * @returns {Object|undefined}
 */
const findById = async (orderId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         uc.email  AS client_email,
         up.email  AS prestataire_email,
         c.name    AS cemetery_name,
         c.city    AS cemetery_city,
         sc.name   AS service_name
       FROM orders o
       LEFT JOIN users uc              ON o.client_id          = uc.id
       LEFT JOIN users up              ON o.prestataire_id     = up.id
       LEFT JOIN cemeteries c          ON o.cemetery_id        = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE o.id = $1`,
      [orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.findById : ${error.message}`);
  }
};

/**
 * Récupère toutes les commandes d'un client avec indication d'avis déposé
 * @param {number} clientId
 * @returns {Array}
 */
const findByClientId = async (clientId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         up.email AS prestataire_email,
         c.name   AS cemetery_name,
         c.city   AS cemetery_city,
         sc.name  AS service_name,
         EXISTS(SELECT 1 FROM reviews WHERE order_id = o.id) AS has_review
       FROM orders o
       LEFT JOIN users up              ON o.prestataire_id      = up.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [clientId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findByClientId : ${error.message}`);
  }
};

/**
 * Récupère toutes les commandes d'un prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const findByPrestataireId = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         uc.email AS client_email,
         c.name   AS cemetery_name,
         c.city   AS cemetery_city,
         sc.name  AS service_name
       FROM orders o
       LEFT JOIN users uc              ON o.client_id           = uc.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE o.prestataire_id = $1
       ORDER BY o.created_at DESC`,
      [prestataireId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findByPrestataireId : ${error.message}`);
  }
};

/**
 * Récupère l'historique des missions terminées d'un prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const findHistoryByPrestataire = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id, o.status, o.price, o.cemetery_location,
         o.scheduled_date, o.created_at, o.updated_at,
         c.name        AS cemetery_name,
         c.city        AS cemetery_city,
         c.department  AS cemetery_department,
         sc.name       AS service_name,
         sc.description AS service_description,
         uc.email      AS client_email,
         uc.prenom     AS client_prenom,
         uc.nom        AS client_nom
       FROM orders o
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       LEFT JOIN users uc              ON o.client_id           = uc.id
       WHERE o.prestataire_id = $1
         AND o.status IN ('completed', 'refunded')
       ORDER BY o.updated_at DESC`,
      [prestataireId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findHistoryByPrestataire : ${error.message}`);
  }
};

/**
 * Récupère les commandes disponibles filtrées par zone géographique
 * Seules les commandes sans prestataire assigné et au statut 'pending' sont retournées
 * @param {string} zone - Département ou ville du prestataire
 * @returns {Array}
 */
const findAvailable = async (zone) => {
  try {
    const result = await pool.query(
      `SELECT
     o.*,
     uc.email     AS client_email,
     c.name       AS cemetery_name,
     c.city       AS cemetery_city,
     c.department AS cemetery_department,
     sc.name      AS service_name,
     sc.base_price
   FROM orders o
   LEFT JOIN users uc              ON o.client_id           = uc.id
   LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
   LEFT JOIN service_categories sc ON o.service_category_id = sc.id
   WHERE o.prestataire_id IS NULL
    AND o.status = ANY(ARRAY['pending', 'paid']::order_status_enum[])
    AND (c.department ILIKE $1 OR c.city ILIKE $1)
   ORDER BY o.created_at DESC`,
      [`%${zone}%`]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findAvailable : ${error.message}`);
  }
};

/**
 * Assigne un prestataire à une commande de façon atomique
 * La condition AND prestataire_id IS NULL évite la double assignation
 * @param {number} orderId
 * @param {number} prestataireId
 * @returns {Object|undefined} - undefined si la commande était déjà assignée
 */
const assignPrestataire = async (orderId, prestataireId) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET prestataire_id = $1, status = 'accepted', accepted_at = NOW()
       WHERE id = $2 AND prestataire_id IS NULL
       RETURNING *`,
      [prestataireId, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.assignPrestataire : ${error.message}`);
  }
};

/**
 * Assigne un prestataire avec une date et heure planifiée
 * Retourne les détails complets avec jointures pour notification immédiate
 * @param {number} orderId
 * @param {number} prestataireId
 * @param {string} scheduledDate
 * @param {string} scheduledTime
 * @returns {Object|null}
 */
const assignPrestataireWithSchedule = async (orderId, prestataireId, scheduledDate, scheduledTime) => {
  try {
    const updateResult = await pool.query(
      `UPDATE orders
       SET prestataire_id = $1, status = 'accepted',
           scheduled_date = $2, scheduled_time = $3,
           accepted_at = NOW(), updated_at = NOW()
       WHERE id = $4
         AND prestataire_id IS NULL
         AND status IN ('paid', 'pending')
       RETURNING *`,
      [prestataireId, scheduledDate, scheduledTime, orderId]
    );

    if (!updateResult.rows[0]) return null;

    // Récupère les détails complets pour le retour et les notifications
    const detailsResult = await pool.query(
      `SELECT
         o.*,
         c.name        AS cemetery_name,
         c.city        AS cemetery_city,
         c.department  AS cemetery_department,
         sc.name       AS service_name,
         uc.email      AS client_email,
         uc.prenom     AS client_prenom,
         uc.nom        AS client_nom
       FROM orders o
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       LEFT JOIN users uc              ON o.client_id           = uc.id
       WHERE o.id = $1`,
      [orderId]
    );
    return detailsResult.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.assignPrestataireWithSchedule : ${error.message}`);
  }
};

/**
 * Met à jour le statut d'une commande
 * @param {number} orderId
 * @param {string} status
 * @returns {Object}
 */
const updateStatus = async (orderId, status) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.updateStatus : ${error.message}`);
  }
};

/**
 * Annule une commande et la remet en statut 'pending' sans prestataire
 * @param {number} orderId
 * @param {string} reason - Motif d'annulation
 * @returns {Object}
 */
const cancelOrder = async (orderId, reason) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET prestataire_id = NULL, status = 'pending',
           cancellation_reason = $1, cancelled_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.cancelOrder : ${error.message}`);
  }
};

/**
 * Marque une commande comme litigieuse avec le motif du client
 * @param {number} orderId
 * @param {string} reason
 * @returns {Object}
 */
const markAsDisputed = async (orderId, reason) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = 'disputed', dispute_reason = $1,
           disputed_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.markAsDisputed : ${error.message}`);
  }
};

/**
 * Résout un litige avec le statut final et l'action prise par l'admin
 * @param {number} orderId
 * @param {string} newStatus - ex: 'completed', 'refunded'
 * @param {string} action - Description de la décision admin
 * @returns {Object}
 */
const resolveDispute = async (orderId, newStatus, action) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, resolution_action = $2,
           resolved_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newStatus, action, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`orderRepository.resolveDispute : ${error.message}`);
  }
};

/**
 * Récupère toutes les commandes — usage admin uniquement
 * @returns {Array}
 */
const findAll = async () => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         uc.email AS client_email,
         up.email AS prestataire_email,
         c.name   AS cemetery_name,
         c.city   AS cemetery_city,
         sc.name  AS service_name
       FROM orders o
       LEFT JOIN users uc              ON o.client_id           = uc.id
       LEFT JOIN users up              ON o.prestataire_id      = up.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       ORDER BY o.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findAll : ${error.message}`);
  }
};

/**
 * Récupère les commandes en attente de validation admin (photos uploadées)
 * @returns {Array}
 */
const findPendingValidation = async () => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         uc.email  AS client_email,
         up.email  AS prestataire_email,
         up.prenom AS prestataire_prenom,
         up.nom    AS prestataire_nom,
         c.name    AS cemetery_name,
         c.city    AS cemetery_city,
         sc.name   AS service_name
       FROM orders o
       LEFT JOIN users uc              ON o.client_id           = uc.id
       LEFT JOIN users up              ON o.prestataire_id      = up.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE o.status = 'awaiting_validation'
       ORDER BY o.updated_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findPendingValidation : ${error.message}`);
  }
};

/**
 * Récupère les commandes en litige — usage admin uniquement
 * @returns {Array}
 */
const findDisputed = async () => {
  try {
    const result = await pool.query(
      `SELECT
         o.*,
         uc.email  AS client_email,
         uc.prenom AS client_prenom,
         uc.nom    AS client_nom,
         up.email  AS prestataire_email,
         up.prenom AS prestataire_prenom,
         up.nom    AS prestataire_nom,
         c.name    AS cemetery_name,
         c.city    AS cemetery_city,
         sc.name   AS service_name
       FROM orders o
       LEFT JOIN users uc              ON o.client_id           = uc.id
       LEFT JOIN users up              ON o.prestataire_id      = up.id
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       WHERE o.status = 'disputed'
       ORDER BY o.updated_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findDisputed : ${error.message}`);
  }
};

/**
 * Calcule les statistiques du dashboard client
 * Les 3 requêtes sont indépendantes, exécutées en parallèle
 * @param {number} userId
 * @returns {Object} - { orders_in_progress, orders_completed, last_order_date }
 */
const getDashboardStats = async (userId) => {
  try {
    const [inProgressResult, completedResult, lastOrderResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM orders
         WHERE client_id = $1
           AND status NOT IN ('completed', 'cancelled', 'refunded')`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) FROM orders
         WHERE client_id = $1 AND status = 'completed'`,
        [userId]
      ),
      pool.query(
        `SELECT created_at FROM orders
         WHERE client_id = $1
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      )
    ]);

    return {
      orders_in_progress: parseInt(inProgressResult.rows[0].count),
      orders_completed: parseInt(completedResult.rows[0].count),
      last_order_date: lastOrderResult.rows[0]?.created_at || null
    };
  } catch (error) {
    throw new Error(`orderRepository.getDashboardStats : ${error.message}`);
  }
};

/**
 * Vérifie qu'un créneau horaire est disponible pour un prestataire
 * Détecte les chevauchements avec les missions déjà planifiées
 * @param {number} prestataireId
 * @param {string} scheduledDate
 * @param {string} scheduledTime - Format HH:MM
 * @param {number} durationHours
 * @returns {boolean}
 */
const checkTimeSlotAvailability = async (prestataireId, scheduledDate, scheduledTime, durationHours) => {
  try {
    const result = await pool.query(
      `SELECT o.scheduled_time, sd.duration_hours
       FROM orders o
       LEFT JOIN service_durations sd ON sd.service_category_id = o.service_category_id
       WHERE o.prestataire_id = $1
         AND o.scheduled_date = $2
         AND o.status NOT IN ('cancelled', 'refunded')
         AND o.scheduled_time IS NOT NULL`,
      [prestataireId, scheduledDate]
    );

    if (result.rows.length === 0) return true;

    const [reqHours, reqMinutes] = scheduledTime.split(':').map(Number);
    const requestedStart = reqHours * 60 + reqMinutes;
    const requestedEnd = requestedStart + (durationHours * 60);

    for (const mission of result.rows) {
      const [missionHours, missionMinutes] = mission.scheduled_time.split(':').map(Number);
      const missionStart = missionHours * 60 + missionMinutes;
      const missionEnd = missionStart + (parseFloat(mission.duration_hours) * 60);

      // Trois cas de chevauchement possibles
      if (
        (requestedStart >= missionStart && requestedStart < missionEnd) ||
        (requestedEnd > missionStart && requestedEnd <= missionEnd) ||
        (requestedStart <= missionStart && requestedEnd >= missionEnd)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    throw new Error(`orderRepository.checkTimeSlotAvailability : ${error.message}`);
  }
};

/**
 * Récupère le calendrier des missions planifiées d'un prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const findCalendarByPrestataire = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id, o.scheduled_date, o.scheduled_time,
         o.status, o.price, o.cemetery_location,
         c.name    AS cemetery_name,
         c.city    AS cemetery_city,
         sc.name   AS service_name,
         sd.duration_hours
       FROM orders o
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       LEFT JOIN service_durations sd  ON sd.service_category_id = sc.id
       WHERE o.prestataire_id = $1
         AND o.scheduled_date IS NOT NULL
         AND o.status IN ('accepted', 'awaiting_validation', 'completed')
       ORDER BY o.scheduled_date ASC, o.scheduled_time ASC`,
      [prestataireId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findCalendarByPrestataire : ${error.message}`);
  }
};

/**
 * Récupère le calendrier d'un prestataire avec infos client — usage admin
 * @param {number} prestataireId
 * @returns {Array}
 */
const findCalendarByPrestataireForAdmin = async (prestataireId) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id, o.scheduled_date, o.scheduled_time,
         o.status, o.price, o.cemetery_location,
         c.name    AS cemetery_name,
         c.city    AS cemetery_city,
         sc.name   AS service_name,
         sd.duration_hours,
         uc.email  AS client_email,
         uc.prenom AS client_prenom,
         uc.nom    AS client_nom
       FROM orders o
       LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
       LEFT JOIN service_categories sc ON o.service_category_id = sc.id
       LEFT JOIN service_durations sd  ON sd.service_category_id = sc.id
       LEFT JOIN users uc              ON o.client_id           = uc.id
       WHERE o.prestataire_id = $1
         AND o.scheduled_date IS NOT NULL
         AND o.status IN ('accepted', 'awaiting_validation', 'completed')
       ORDER BY o.scheduled_date ASC, o.scheduled_time ASC`,
      [prestataireId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`orderRepository.findCalendarByPrestataireForAdmin : ${error.message}`);
  }
};

/**
 * Récupère la durée par défaut d'un service
 * Retourne 2h si aucune durée n'est définie pour ce service
 * @param {number} serviceCategoryId
 * @returns {number} - Durée en heures
 */
const getServiceDuration = async (serviceCategoryId) => {
  try {
    const result = await pool.query(
      `SELECT duration_hours FROM service_durations
       WHERE service_category_id = $1`,
      [serviceCategoryId]
    );
    return result.rows[0]?.duration_hours || 2.0;
  } catch (error) {
    throw new Error(`orderRepository.getServiceDuration : ${error.message}`);
  }
};

module.exports = {
  create,
  findById,
  findByClientId,
  findByPrestataireId,
  findHistoryByPrestataire,
  findAvailable,
  findAll,
  findPendingValidation,
  findDisputed,
  assignPrestataire,
  assignPrestataireWithSchedule,
  updateStatus,
  cancelOrder,
  markAsDisputed,
  resolveDispute,
  getDashboardStats,
  checkTimeSlotAvailability,
  findCalendarByPrestataire,
  findCalendarByPrestataireForAdmin,
  getServiceDuration
};
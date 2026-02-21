// backend/repositories/orderRepository.js
const pool = require('../config/db');

/**
 * REPOSITORY : Accès à la table orders
 * Responsabilité : Requêtes SQL uniquement
 * Note: Utilise le schéma avec cemetery_id et service_category_id
 */

/**
 * Créer une nouvelle commande
 */
const create = async (orderData) => {
  const query = `
    INSERT INTO orders (
      client_id, 
      prestataire_id, 
      cemetery_id,
      service_category_id,
      cemetery_location, 
      status, 
      price, 
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  
  const values = [
    orderData.client_id,
    orderData.prestataire_id || null,
    orderData.cemetery_id,
    orderData.service_category_id,
    orderData.cemetery_location || null,
    orderData.status || 'pending',
    orderData.price
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Récupérer une commande par ID avec détails
 */
const findById = async (orderId) => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      up.email as prestataire_email,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN users up ON o.prestataire_id = up.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.id = $1
  `;
  const result = await pool.query(query, [orderId]);
  return result.rows[0];
};

/**
 * Récupérer toutes les commandes d'un client
 */
const findByClientId = async (clientId) => {
  const query = `
    SELECT 
      o.*,
      up.email as prestataire_email,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name,
      EXISTS(SELECT 1 FROM reviews WHERE order_id = o.id) as has_review
    FROM orders o
    LEFT JOIN users up ON o.prestataire_id = up.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.client_id = $1
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query, [clientId]);
  return result.rows;
};

/**
 * Récupérer l'historique des missions d'un prestataire (terminées/validées)
 */
const findHistoryByPrestataire = async (prestatairId) => {
  const query = `
    SELECT 
      o.id,
      o.status,
      o.price,
      o.cemetery_location,
      o.scheduled_date,
      o.created_at,
      o.updated_at,
      c.name as cemetery_name,
      c.city as cemetery_city,
      c.department as cemetery_department,
      sc.name as service_name,
      sc.description as service_description,
      uc.email as client_email,
      uc.prenom as client_prenom,
      uc.nom as client_nom
    FROM orders o
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN users uc ON o.client_id = uc.id
    WHERE o.prestataire_id = $1
    AND o.status IN ('completed', 'refunded')
    ORDER BY o.updated_at DESC
  `;
  const result = await pool.query(query, [prestatairId]);
  return result.rows;
};

/**
 * Récupérer toutes les commandes d'un prestataire
 */
const findByPrestatairId = async (prestatairId) => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.prestataire_id = $1
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query, [prestatairId]);
  return result.rows;
};

/**
 * Récupérer les commandes disponibles (sans prestataire assigné)
 * Filtrées par zone géographique (département du cimetière)
 */
const findAvailable = async (zone) => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      c.name as cemetery_name,
      c.city as cemetery_city,
      c.department as cemetery_department,
      sc.name as service_name,
      sc.base_price
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.prestataire_id IS NULL
    AND o.status = 'pending'
    AND (c.department ILIKE $1 OR c.city ILIKE $1)
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query, [`%${zone}%`]);
  return result.rows;
};

/**
 * Assigner un prestataire à une commande (atomique)
 * Change aussi le statut de 'pending' à 'accepted'
 */
const assignPrestataire = async (orderId, prestatairId) => {
  const query = `
    UPDATE orders
    SET 
      prestataire_id = $1, 
      status = 'accepted',
      accepted_at = NOW()
    WHERE id = $2
    AND prestataire_id IS NULL
    RETURNING *
  `;
  const result = await pool.query(query, [prestatairId, orderId]);
  return result.rows[0];
};

/**
 * Mettre à jour le statut d'une commande
 */
const updateStatus = async (orderId, status) => {
  const query = `
    UPDATE orders
    SET 
      status = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, orderId]);
  return result.rows[0];
};

const cancelOrder = async (orderId, reason) => {
  const query = `
    UPDATE orders
    SET 
      prestataire_id = NULL,
      status = 'pending',
      cancellation_reason = $1,
      cancelled_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [reason, orderId]);
  return result.rows[0];
};

/**
 * Récupérer toutes les commandes (pour admin)
 */
const findAll = async () => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      up.email as prestataire_email,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN users up ON o.prestataire_id = up.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Récupérer les commandes en attente de validation (pour admin)
 */
const findPendingValidation = async () => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      up.email as prestataire_email,
      up.prenom as prestataire_prenom,
      up.nom as prestataire_nom,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN users up ON o.prestataire_id = up.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.status = 'awaiting_validation'
    ORDER BY o.updated_at DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
};


/**
 * Récupérer les commandes en litige
 */
const findDisputed = async () => {
  const query = `
    SELECT 
      o.*,
      uc.email as client_email,
      uc.prenom as client_prenom,
      uc.nom as client_nom,
      up.email as prestataire_email,
      up.prenom as prestataire_prenom,
      up.nom as prestataire_nom,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN users uc ON o.client_id = uc.id
    LEFT JOIN users up ON o.prestataire_id = up.id
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.status = 'disputed'
    ORDER BY o.updated_at DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Marquer une commande comme litigieuse
 */
const markAsDisputed = async (orderId, reason) => {
  const query = `
    UPDATE orders
    SET 
      status = 'disputed',
      dispute_reason = $1,
      disputed_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [reason, orderId]);
  return result.rows[0];
};

/**
 * Vérifier la disponibilité du créneau horaire
 */
const checkTimeSlotAvailability = async (prestatairId, scheduledDate, scheduledTime, durationHours) => {
  const query = `
    SELECT 
      o.scheduled_time,
      sd.duration_hours
    FROM orders o
    LEFT JOIN service_durations sd ON sd.service_category_id = o.service_category_id
    WHERE o.prestataire_id = $1
    AND o.scheduled_date = $2
    AND o.status NOT IN ('cancelled', 'refunded')
    AND o.scheduled_time IS NOT NULL
  `;
  const result = await pool.query(query, [prestatairId, scheduledDate]);
  
  // Si aucune mission ce jour-là, c'est disponible
  if (result.rows.length === 0) return true;

  // Convertir l'heure demandée en minutes depuis minuit
  const [reqHours, reqMinutes] = scheduledTime.split(':').map(Number);
  const requestedStart = reqHours * 60 + reqMinutes;
  const requestedEnd = requestedStart + (durationHours * 60);

  // Vérifier les chevauchements
  for (const mission of result.rows) {
    const [missionHours, missionMinutes] = mission.scheduled_time.split(':').map(Number);
    const missionStart = missionHours * 60 + missionMinutes;
    const missionEnd = missionStart + (parseFloat(mission.duration_hours) * 60);

    // Chevauchement détecté
    if (
      (requestedStart >= missionStart && requestedStart < missionEnd) ||
      (requestedEnd > missionStart && requestedEnd <= missionEnd) ||
      (requestedStart <= missionStart && requestedEnd >= missionEnd)
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Assigner un prestataire avec date ET heure planifiée
 */
const assignPrestataireWithSchedule = async (orderId, prestataireId, scheduledDate, scheduledTime) => {
  // 1. Faire l'update
  const updateQuery = `
    UPDATE orders 
    SET prestataire_id = $1, 
        status = 'accepted',
        scheduled_date = $2,
        scheduled_time = $3,
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = $4 
      AND prestataire_id IS NULL
      AND status IN ('paid', 'pending')
    RETURNING *
  `;
  
  const updateResult = await pool.query(updateQuery, [prestataireId, scheduledDate, scheduledTime, orderId]);
  
  if (!updateResult.rows[0]) {
    return null;
  }

  // 2. Récupérer les détails complets avec les jointures
  const detailsQuery = `
    SELECT 
      o.*,
      c.name as cemetery_name,
      c.city as cemetery_city,
      c.department as cemetery_department,
      sc.name as service_name,
      uc.email as client_email,
      uc.prenom as client_prenom,
      uc.nom as client_nom
    FROM orders o
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN users uc ON o.client_id = uc.id
    WHERE o.id = $1
  `;
  
  const detailsResult = await pool.query(detailsQuery, [orderId]);
  return detailsResult.rows[0];
};

/**
 * Récupérer le calendrier avec horaires
 */
const findCalendarByPrestataire = async (prestatairId) => {
  const query = `
    SELECT 
      o.id,
      o.scheduled_date,
      o.scheduled_time,
      o.status,
      o.price,
      o.cemetery_location,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name,
      sd.duration_hours
    FROM orders o
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN service_durations sd ON sd.service_category_id = sc.id
    WHERE o.prestataire_id = $1
    AND o.scheduled_date IS NOT NULL
    AND o.status IN ('accepted', 'awaiting_validation', 'completed')
    ORDER BY o.scheduled_date ASC, o.scheduled_time ASC
  `;
  const result = await pool.query(query, [prestatairId]);
  return result.rows;
};

/**
 * Récupérer la durée d'un service
 */
const getServiceDuration = async (serviceCategoryId) => {
  const query = `
    SELECT duration_hours 
    FROM service_durations 
    WHERE service_category_id = $1
  `;
  const result = await pool.query(query, [serviceCategoryId]);
  return result.rows[0]?.duration_hours || 2.0; // 2h par défaut
};

/**
 * Résoudre un litige (mettre à jour statut + action)
 */
const resolveDispute = async (orderId, newStatus, action) => {
  const query = `
    UPDATE orders
    SET 
      status = $1,
      resolution_action = $2,
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  
  const result = await pool.query(query, [newStatus, action, orderId]);
  return result.rows[0];
};

const getDashboardStats = async (userId) => {
  console.log('📊 Repository: calcul stats pour userId:', userId);

  // Commandes en cours
  const inProgressQuery = `
    SELECT COUNT(*) 
    FROM orders 
    WHERE client_id = $1 
      AND status NOT IN ('completed', 'cancelled', 'refunded')
  `;
  const inProgressResult = await pool.query(inProgressQuery, [userId]);

  // Commandes terminées
  const completedQuery = `
    SELECT COUNT(*) 
    FROM orders 
    WHERE client_id = $1 
      AND status = 'completed'
  `;
  const completedResult = await pool.query(completedQuery, [userId]);

  // Dernière commande
  const lastOrderQuery = `
    SELECT created_at 
    FROM orders 
    WHERE client_id = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const lastOrderResult = await pool.query(lastOrderQuery, [userId]);

  const stats = {
    orders_in_progress: parseInt(inProgressResult.rows[0].count),
    orders_completed: parseInt(completedResult.rows[0].count),
    last_order_date: lastOrderResult.rows[0]?.created_at || null,
  };

  console.log('📊 Stats calculées:', stats);
  return stats;
};

/**
 * Récupérer le calendrier d'un prestataire (pour admin)
 */
const findCalendarByPrestataireForAdmin = async (prestatairId) => {
  const query = `
    SELECT 
      o.id,
      o.scheduled_date,
      o.scheduled_time,
      o.status,
      o.price,
      o.cemetery_location,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name,
      sd.duration_hours,
      uc.email as client_email,
      uc.prenom as client_prenom,
      uc.nom as client_nom
    FROM orders o
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    LEFT JOIN service_durations sd ON sd.service_category_id = sc.id
    LEFT JOIN users uc ON o.client_id = uc.id
    WHERE o.prestataire_id = $1
    AND o.scheduled_date IS NOT NULL
    AND o.status IN ('accepted', 'awaiting_validation', 'completed')
    ORDER BY o.scheduled_date ASC, o.scheduled_time ASC
  `;
  const result = await pool.query(query, [prestatairId]);
  return result.rows;
};


module.exports = {
  create,
  findById,
  findByClientId,
  findByPrestatairId,
  findAvailable,
  assignPrestataire,
  updateStatus,
  cancelOrder,
  findPendingValidation,
  findAll,
  findDisputed,
  resolveDispute,
  getDashboardStats,
  markAsDisputed,
  findHistoryByPrestataire,
  checkTimeSlotAvailability,
  assignPrestataireWithSchedule,
  findCalendarByPrestataire,
  getServiceDuration,
  findCalendarByPrestataireForAdmin
};
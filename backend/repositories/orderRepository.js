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
      sc.name as service_name
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

module.exports = {
  create,
  findById,
  findByClientId,
  findByPrestatairId,
  findAvailable,
  assignPrestataire,
  updateStatus,
  findAll
};
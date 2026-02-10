// backend/services/orderService.js
const orderRepository = require('../repositories/orderRepository');
const userRepository = require('../repositories/userRepository');

/**
 * SERVICE : Logique métier pour les commandes
 * Responsabilité : Validations métier, orchestration
 */

/**
 * Créer une nouvelle commande (client uniquement)
 */
const createOrder = async (clientId, orderData) => {
  const { cemetery_id, service_category_id, cemetery_location, price } = orderData;

  // ============ VALIDATIONS MÉTIER ============

  // 1. Vérifier que l'utilisateur est bien un client
  const user = await userRepository.findById(clientId);
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'client') {
    const error = new Error('Seuls les clients peuvent créer des commandes');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // 2. Validation des données obligatoires
  if (!cemetery_id || !service_category_id || !price) {
    const error = new Error('Données manquantes (cemetery_id, service_category_id, price)');
    error.code = 'MISSING_FIELDS';
    error.statusCode = 400;
    throw error;
  }

  // 3. Validation du prix
  if (price <= 0) {
    const error = new Error('Le prix doit être supérieur à 0');
    error.code = 'INVALID_PRICE';
    error.statusCode = 400;
    throw error;
  }

  // ============ CRÉATION COMMANDE ============

  const newOrder = await orderRepository.create({
    client_id: clientId,
    cemetery_id,
    service_category_id,
    cemetery_location,
    status: 'pending',
    price
  });

  return newOrder;
};

/**
 * Récupérer les commandes d'un utilisateur (selon son rôle)
 */
const getUserOrders = async (userId, userRole) => {
  if (userRole === 'client') {
    return await orderRepository.findByClientId(userId);
  }
  
  if (userRole === 'prestataire') {
    return await orderRepository.findByPrestatairId(userId);
  }
  
  if (userRole === 'admin') {
    return await orderRepository.findAll();
  }

  return [];
};

/**
 * Récupérer une commande par ID
 * Vérifie que l'utilisateur a le droit de voir cette commande
 */
const getOrderById = async (orderId, userId, userRole) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    return null;
  }

  // Vérification des permissions
  if (userRole === 'client' && order.client_id !== userId) {
    const error = new Error('Vous n\'avez pas accès à cette commande');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  if (userRole === 'prestataire' && order.prestataire_id !== userId) {
    const error = new Error('Vous n\'avez pas accès à cette commande');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // Admin peut tout voir
  return order;
};

/**
 * Récupérer les missions disponibles (prestataire uniquement)
 */
const getAvailableOrders = async (prestatairId) => {
  // 1. Vérifier que c'est bien un prestataire
  const user = await userRepository.findById(prestatairId);
  
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'prestataire') {
    const error = new Error('Seuls les prestataires peuvent voir les missions disponibles');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // 2. Vérifier que le prestataire a une zone d'intervention
  const zone = user.zone_intervention;
  if (!zone) {
    return []; // Pas de zone = pas de missions
  }

  // 3. Récupérer les commandes disponibles dans sa zone
  return await orderRepository.findAvailable(zone);
};

/**
 * Accepter une mission (prestataire uniquement)
 */
const acceptOrder = async (orderId, prestatairId) => {
  // 1. Vérifier que l'utilisateur est prestataire
  const user = await userRepository.findById(prestatairId);
  
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'prestataire') {
    const error = new Error('Seuls les prestataires peuvent accepter des missions');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // 2. Vérifier que la commande existe
  const order = await orderRepository.findById(orderId);
  
  if (!order) {
    const error = new Error('Commande introuvable');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // 3. Vérifier que la commande est disponible
  if (order.prestataire_id !== null) {
    const error = new Error('Cette mission est déjà assignée à un autre prestataire');
    error.code = 'ORDER_ALREADY_ASSIGNED';
    error.statusCode = 409;
    throw error;
  }

// 4. Vérifier que le cimetière est dans la zone du prestataire
const zone = user.zone_intervention;
if (zone) {
  const zoneMatch = 
    (order.cemetery_department && order.cemetery_department.toLowerCase().includes(zone.toLowerCase())) ||
    (order.cemetery_city && order.cemetery_city.toLowerCase().includes(zone.toLowerCase()));
  
  if (!zoneMatch) {
    const error = new Error('Cette mission n\'est pas dans votre zone d\'intervention');
    error.code = 'ZONE_MISMATCH';
    error.statusCode = 403;
    throw error;
  }
}

  // 5. Assigner le prestataire (opération atomique en BDD)
  const updatedOrder = await orderRepository.assignPrestataire(orderId, prestatairId);
  
  // 6. Double vérification : si un autre prestataire a accepté entre-temps
  if (!updatedOrder) {
    const error = new Error('Cette mission vient d\'être acceptée par un autre prestataire');
    error.code = 'ORDER_ALREADY_ASSIGNED';
    error.statusCode = 409;
    throw error;
  }

  return updatedOrder;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAvailableOrders,
  acceptOrder
};
// backend/services/orderService.js
const orderRepository           = require('../repositories/orderRepository');
const userRepository            = require('../repositories/userRepository');
const paymentRepository         = require('../repositories/paymentRepository');
const photoRepository           = require('../repositories/photoRepository');
const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');

/**
 * Service de gestion des commandes.
 * Orchestre l'intégralité du cycle de vie d'une commande :
 * création → paiement → assignation → réalisation → validation → paiement prestataire.
 * C'est le service le plus sollicité de l'application.
 */

/**
 * Vérifie qu'un utilisateur a le rôle admin — factorisé car utilisé dans 6 fonctions
 * @param {number} adminId
 */
const checkAdminAccess = async (adminId) => {
  const admin = await userRepository.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }
};

/**
 * Crée une nouvelle commande pour un client
 * Le prix est récupéré depuis la BDD — jamais depuis le frontend (sécurité)
 * @param {number} clientId
 * @param {Object} orderData - { cemetery_id, service_category_id, cemetery_location }
 * @returns {Object} - La commande créée
 */
const createOrder = async (clientId, orderData) => {
  try {
    const { cemetery_id, service_category_id, cemetery_location } = orderData;

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

    if (!cemetery_id || !service_category_id) {
      const error = new Error('Données manquantes (cemetery_id, service_category_id)');
      error.code = 'MISSING_FIELDS';
      error.statusCode = 400;
      throw error;
    }

    // Récupère le prix depuis la BDD — le frontend ne peut pas imposer un prix
    const service = await serviceCategoryRepository.findById(service_category_id);
    if (!service) {
      const error = new Error('Service introuvable');
      error.code = 'SERVICE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (!service.is_active) {
      const error = new Error('Ce service n\'est plus disponible');
      error.code = 'SERVICE_INACTIVE';
      error.statusCode = 400;
      throw error;
    }

    const price = parseFloat(service.base_price);
    if (!price || price <= 0) {
      const error = new Error('Prix du service invalide');
      error.code = 'INVALID_PRICE';
      error.statusCode = 400;
      throw error;
    }

    return await orderRepository.create({
      client_id: clientId,
      cemetery_id,
      service_category_id,
      cemetery_location,
      status: 'pending',
      price
    });

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.createOrder : ${error.message}`);
  }
};

/**
 * Récupère les commandes d'un utilisateur selon son rôle
 * @param {number} userId
 * @param {string} userRole
 * @returns {Array}
 */
const getUserOrders = async (userId, userRole) => {
  try {
    if (userRole === 'client')      return await orderRepository.findByClientId(userId);
    if (userRole === 'prestataire') return await orderRepository.findByPrestataireId(userId);
    if (userRole === 'admin')       return await orderRepository.findAll();
    return [];
  } catch (error) {
    throw new Error(`orderService.getUserOrders : ${error.message}`);
  }
};

/**
 * Récupère une commande par son ID
 * Vérifie que l'utilisateur a le droit d'y accéder
 * @param {number} orderId
 * @param {number} userId
 * @param {string} userRole
 * @returns {Object|null}
 */
const getOrderById = async (orderId, userId, userRole) => {
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) return null;

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

    return order;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getOrderById : ${error.message}`);
  }
};

/**
 * Récupère les missions disponibles dans la zone du prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const getAvailableOrders = async (prestataireId) => {
  try {
    const user = await userRepository.findById(prestataireId);
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

    // Sans zone définie, aucune mission ne peut être proposée
    if (!user.zone_intervention) return [];

    return await orderRepository.findAvailable(user.zone_intervention);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getAvailableOrders : ${error.message}`);
  }
};

/**
 * Accepte une mission avec date et heure planifiées
 * Valide la date (aujourd'hui + 15 jours max), l'heure (7h-19h),
 * la durée du service et la disponibilité du créneau
 * @param {number} orderId
 * @param {number} prestataireId
 * @param {string} scheduledDate
 * @param {string} scheduledTime - Format HH:MM
 * @returns {Object} - La commande mise à jour avec détails
 */
const acceptOrder = async (orderId, prestataireId, scheduledDate, scheduledTime) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Seuls les prestataires peuvent accepter des missions');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.prestataire_id !== null) {
      const error = new Error('Cette mission est déjà assignée');
      error.code = 'ORDER_ALREADY_ASSIGNED';
      error.statusCode = 409;
      throw error;
    }

    if (!scheduledDate || !scheduledTime) {
      const error = new Error('La date et l\'heure sont obligatoires');
      error.code = 'MISSING_SCHEDULE';
      error.statusCode = 400;
      throw error;
    }

    // Validation de la fenêtre de planification : aujourd'hui → +15 jours
    const selectedDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);

    if (selectedDate < today) {
      const error = new Error('La date ne peut pas être dans le passé');
      error.code = 'INVALID_DATE';
      error.statusCode = 400;
      throw error;
    }

    if (selectedDate > maxDate) {
      const error = new Error('La date ne peut pas dépasser 15 jours');
      error.code = 'DATE_TOO_FAR';
      error.statusCode = 400;
      throw error;
    }

    // Validation de la plage horaire autorisée : 7h → 19h
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    if (hours < 7 || hours >= 19) {
      const error = new Error('L\'heure doit être entre 7h et 19h');
      error.code = 'INVALID_TIME';
      error.statusCode = 400;
      throw error;
    }

    // Vérifie que la mission se termine avant 19h compte tenu de sa durée
    const durationHours  = await orderRepository.getServiceDuration(order.service_category_id);
    const startMinutes   = hours * 60 + minutes;
    const endHours       = Math.floor((startMinutes + durationHours * 60) / 60);

    if (endHours >= 19) {
      const error = new Error(`Cette mission dure ${durationHours}h et se terminerait après 19h. Choisissez une heure plus tôt.`);
      error.code = 'MISSION_TOO_LATE';
      error.statusCode = 400;
      throw error;
    }

    // Vérifie l'absence de chevauchement avec d'autres missions
    const isAvailable = await orderRepository.checkTimeSlotAvailability(
      prestataireId, scheduledDate, scheduledTime, durationHours
    );
    if (!isAvailable) {
      const error = new Error('Ce créneau chevauche une autre mission');
      error.code = 'TIME_CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    // Vérifie que le cimetière est bien dans la zone du prestataire
    if (user.zone_intervention) {
      const zone              = user.zone_intervention.toLowerCase();
      const cemeteryCity      = (order.cemetery_city       || '').toLowerCase();
      const cemeteryDept      = (order.cemetery_department || '').toLowerCase();
      const cemeteryPostal    = (order.cemetery_postal_code || '');

      const isInZone =
        cemeteryCity.includes(zone)   || cemeteryDept.includes(zone) ||
        zone.includes(cemeteryCity)   || zone.includes(cemeteryDept) ||
        cemeteryPostal.startsWith(zone);

      if (!isInZone) {
        const error = new Error(`Cette mission n'est pas dans votre zone (${user.zone_intervention}). Cimetière : ${order.cemetery_city} (${order.cemetery_department})`);
        error.code = 'ZONE_MISMATCH';
        error.statusCode = 403;
        throw error;
      }
    }

    const updatedOrder = await orderRepository.assignPrestataireWithSchedule(
      orderId, prestataireId, scheduledDate, scheduledTime
    );

    if (!updatedOrder) {
      const error = new Error('Cette mission vient d\'être acceptée par un autre prestataire');
      error.code = 'ORDER_ALREADY_ASSIGNED';
      error.statusCode = 409;
      throw error;
    }

    return updatedOrder;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.acceptOrder : ${error.message}`);
  }
};

/**
 * Récupère le calendrier des missions planifiées d'un prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const getProviderCalendar = async (prestataireId) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }
    return await orderRepository.findCalendarByPrestataire(prestataireId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getProviderCalendar : ${error.message}`);
  }
};

/**
 * Récupère l'historique des missions terminées d'un prestataire
 * @param {number} prestataireId
 * @returns {Array}
 */
const getProviderHistory = async (prestataireId) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }
    return await orderRepository.findHistoryByPrestataire(prestataireId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getProviderHistory : ${error.message}`);
  }
};

/**
 * Marque une mission comme terminée côté prestataire
 * Vérifie que les photos avant/après sont bien uploadées avant de passer en awaiting_validation
 * @param {number} orderId
 * @param {number} prestataireId
 * @returns {Object} - La commande mise à jour
 */
const completeOrder = async (orderId, prestataireId) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Seuls les prestataires peuvent compléter des missions');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.prestataire_id !== prestataireId) {
      const error = new Error('Cette mission ne vous est pas assignée');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    if (order.status !== 'accepted') {
      const error = new Error('Cette mission n\'est pas en cours');
      error.code = 'INVALID_STATUS';
      error.statusCode = 400;
      throw error;
    }

    // Bloque la complétion si les photos avant/après ne sont pas uploadées
    const photos       = await photoRepository.findByOrderId(orderId);
    const hasBeforePhoto = photos.some(p => p.type === 'before');
    const hasAfterPhoto  = photos.some(p => p.type === 'after');

    if (!hasBeforePhoto || !hasAfterPhoto) {
      const error = new Error('Vous devez uploader les photos avant et après avant de terminer la mission');
      error.code = 'MISSING_PHOTOS';
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, 'awaiting_validation');
    if (!updatedOrder) {
      const error = new Error('Erreur lors de la mise à jour du statut');
      error.code = 'UPDATE_FAILED';
      error.statusCode = 500;
      throw error;
    }

    return updatedOrder;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.completeOrder : ${error.message}`);
  }
};

/**
 * Annule une mission acceptée (prestataire uniquement)
 * Remet la commande en statut 'pending' sans prestataire assigné
 * @param {number} orderId
 * @param {number} prestataireId
 * @param {string} reason - Motif d'annulation
 * @returns {Object}
 */
const cancelOrder = async (orderId, prestataireId, reason) => {
  try {
    const user = await userRepository.findById(prestataireId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Seuls les prestataires peuvent annuler une mission');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.prestataire_id !== prestataireId) {
      const error = new Error('Cette mission ne vous est pas assignée');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    if (order.status !== 'accepted') {
      const error = new Error('Cette mission ne peut plus être annulée');
      error.code = 'INVALID_STATUS';
      error.statusCode = 400;
      throw error;
    }

    return await orderRepository.cancelOrder(orderId, reason);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.cancelOrder : ${error.message}`);
  }
};

/**
 * Valide une intervention et déclenche le paiement du prestataire (admin uniquement)
 * Simule un transfert Stripe en mode test (80% prestataire / 20% commission)
 * @param {number} orderId
 * @param {number} adminId
 * @returns {Object} - { order, transfer: { amount, transfer_id, recipient_id } }
 */
const validateOrder = async (orderId, adminId) => {
  try {
    await checkAdminAccess(adminId);

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.status !== 'awaiting_validation') {
      const error = new Error('Cette commande n\'est pas en attente de validation');
      error.code = 'INVALID_STATUS';
      error.statusCode = 400;
      throw error;
    }

    // Vérifie une dernière fois la présence des photos avant validation
    const photos         = await photoRepository.findByOrderId(orderId);
    const hasBeforePhoto = photos.some(p => p.type === 'before');
    const hasAfterPhoto  = photos.some(p => p.type === 'after');

    if (!hasBeforePhoto || !hasAfterPhoto) {
      const error = new Error('Photos avant/après manquantes');
      error.code = 'MISSING_PHOTOS';
      error.statusCode = 400;
      throw error;
    }

    // Calcul de la répartition : 80% prestataire / 20% commission plateforme
    const providerAmount     = parseFloat(order.price) * 0.80;
    const simulatedTransferId = `tr_simulated_${Date.now()}`;

    // Enregistre le transfert vers le prestataire
    await paymentRepository.create({
      order_id:           orderId,
      amount:             providerAmount,
      stripe_transfer_id: simulatedTransferId,
      status:             'released',
      payment_type:       'provider_transfer',
      recipient_id:       order.prestataire_id
    });

    await orderRepository.updateStatus(orderId, 'completed');
    const updatedOrder = await orderRepository.findById(orderId);

    return {
      order:    updatedOrder,
      transfer: {
        amount:       providerAmount,
        transfer_id:  simulatedTransferId,
        recipient_id: order.prestataire_id
      }
    };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.validateOrder : ${error.message}`);
  }
};

/**
 * Récupère les commandes en attente de validation admin
 * @param {number} adminId
 * @returns {Array}
 */
const getPendingValidationOrders = async (adminId) => {
  try {
    await checkAdminAccess(adminId);
    return await orderRepository.findPendingValidation();
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getPendingValidationOrders : ${error.message}`);
  }
};

/**
 * Récupère les commandes en litige (admin)
 * @param {number} adminId
 * @returns {Array}
 */
const getDisputedOrders = async (adminId) => {
  try {
    await checkAdminAccess(adminId);
    return await orderRepository.findDisputed();
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getDisputedOrders : ${error.message}`);
  }
};

/**
 * Marque une commande comme litigieuse avec le motif (admin)
 * @param {number} orderId
 * @param {number} adminId
 * @param {string} reason
 * @returns {Object}
 */
const markOrderAsDisputed = async (orderId, adminId, reason) => {
  try {
    await checkAdminAccess(adminId);

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.status !== 'awaiting_validation') {
      const error = new Error('Seules les commandes en attente de validation peuvent être marquées comme litigieuses');
      error.code = 'INVALID_STATUS';
      error.statusCode = 400;
      throw error;
    }

    return await orderRepository.markAsDisputed(orderId, reason);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.markOrderAsDisputed : ${error.message}`);
  }
};

/**
 * Récupère le calendrier d'un prestataire — usage admin
 * @param {number} adminId
 * @param {number} prestataireId
 * @returns {Array}
 */
const getProviderCalendarForAdmin = async (adminId, prestataireId) => {
  try {
    await checkAdminAccess(adminId);
    return await orderRepository.findCalendarByPrestataireForAdmin(prestataireId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.getProviderCalendarForAdmin : ${error.message}`);
  }
};

/**
 * Résout un litige avec trois actions possibles (admin uniquement) :
 * - 'validate'           → valide l'intervention et paie le prestataire
 * - 'refund'             → rembourse le client (TODO: Stripe Refund en production)
 * - 'request_correction' → renvoie la commande en statut 'accepted' pour correction
 * @param {number} orderId
 * @param {number} adminId
 * @param {string} action - 'validate' | 'refund' | 'request_correction'
 * @returns {Object} - { order, ...additionalActions }
 */
const resolveDispute = async (orderId, adminId, action) => {
  try {
    await checkAdminAccess(adminId);

    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Commande introuvable');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (order.status !== 'disputed') {
      const error = new Error('Cette commande n\'est pas en litige');
      error.code = 'NOT_DISPUTED';
      error.statusCode = 400;
      throw error;
    }

    let newStatus;
    let additionalActions = {};

    switch (action) {
      case 'validate': {
        // Valide malgré le litige → paie le prestataire
        const providerAmount      = parseFloat(order.price) * 0.80;
        const simulatedTransferId = `tr_dispute_resolved_${Date.now()}`;

        await paymentRepository.create({
          order_id:           orderId,
          amount:             providerAmount,
          stripe_transfer_id: simulatedTransferId,
          status:             'released',
          payment_type:       'provider_transfer',
          recipient_id:       order.prestataire_id
        });

        newStatus                  = 'completed';
        additionalActions.payment  = {
          amount:      providerAmount,
          transfer_id: simulatedTransferId
        };
        break;
      }

      case 'refund': {
        // Rembourse le client — TODO: intégrer Stripe Refund en production
        newStatus                 = 'refunded';
        additionalActions.refund  = { amount: order.price };
        break;
      }

      case 'request_correction': {
        // Renvoie la commande au prestataire pour correction
        newStatus = 'accepted';
        break;
      }

      default: {
        const error = new Error('Action invalide — valeurs acceptées : validate, refund, request_correction');
        error.code = 'INVALID_ACTION';
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedOrder = await orderRepository.resolveDispute(orderId, newStatus, action);

    return {
      order: updatedOrder,
      ...additionalActions
    };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`orderService.resolveDispute : ${error.message}`);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAvailableOrders,
  acceptOrder,
  cancelOrder,
  completeOrder,
  validateOrder,
  getPendingValidationOrders,
  getDisputedOrders,
  markOrderAsDisputed,
  resolveDispute,
  getProviderHistory,
  getProviderCalendar,
  getProviderCalendarForAdmin
};
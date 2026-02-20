// backend/controllers/orderController.js
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
const orderRepository = require('../repositories/orderRepository');

/**
 * CONTROLLER : Orchestration des commandes
 * Responsabilité : Recevoir req, appeler service, formatter res
 */

/**
 * @desc    Créer une nouvelle commande
 * @route   POST /api/orders
 * @access  Private (Client uniquement)
 */
const createOrder = async (req, res) => {
  try {
    const result = await orderService.createOrder(
      req.user.userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Commande créée avec succès'
    });

  } catch (error) {
    console.error('Erreur création commande:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la création de la commande'
      }
    });
  }
};

/**
 * @desc    Récupérer les commandes de l'utilisateur connecté
 * @route   GET /api/orders
 * @access  Private (Tous rôles)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Erreur récupération commandes:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des commandes'
      }
    });
  }
};

/**
 * @desc    Récupérer les missions disponibles
 * @route   GET /api/orders/available
 * @access  Private (Prestataire uniquement)
 */
const getAvailableOrders = async (req, res) => {
  try {
    const orders = await orderService.getAvailableOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Erreur récupération missions disponibles:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des missions disponibles'
      }
    });
  }
};

/**
 * @desc    Accepter une mission
 * @route   PATCH /api/orders/:id/accept
 * @access  Private (Prestataire uniquement)
 */

const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_date, scheduled_time } = req.body;
    const prestatairId = req.user.userId;

    // Accepter et planifier la mission
    const order = await orderService.acceptOrder(id, prestatairId, scheduled_date, scheduled_time);

    // Créer une notification pour le prestataire
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      user_id: prestatairId,
      type: 'schedule_needed',
      title: '✅ Mission acceptée',
      message: `Commande #${order.id.substring(0, 8)} - Vous avez accepté une mission au ${order.cemetery_name}. Intervention prévue le ${new Date(scheduled_date).toLocaleDateString('fr-FR')} à ${scheduled_time}.`,
      order_id: order.id
    });

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Mission acceptée et planifiée'
    });
  } catch (error) {
    console.error('Erreur acceptation mission:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

/**
 * @desc    Compléter une mission
 * @route   PATCH /api/orders/:id/complete
 * @access  Private (Prestataire uniquement)
 */
const completeOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const result = await orderService.completeOrder(orderId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Mission terminée avec succès. En attente de validation client.'
    });

  } catch (error) {
    console.error('Erreur complétion mission:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la complétion de la mission'
      }
    });
  }
};

/**
 * @desc    Annuler une mission
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (Prestataire uniquement)
 */
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    const result = await orderService.cancelOrder(orderId, req.user.userId, reason);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Mission annulée avec succès'
    });

  } catch (error) {
    console.error('Erreur annulation mission:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'annulation'
      }
    });
  }
};

/**
 * @desc    Récupérer les détails d'une commande
 * @route   GET /api/orders/:id
 * @access  Private (Tous)
 */
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderService.getOrderById(orderId, req.user.userId, req.user.role);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Commande introuvable'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Erreur récupération commande:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération de la commande'
      }
    });
  }
};

/**
 * @desc    Récupérer les commandes en attente de validation
 * @route   GET /api/orders/pending-validation
 * @access  Private (Admin uniquement)
 */
const getPendingValidation = async (req, res) => {
  try {
    const orders = await orderService.getPendingValidationOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Erreur récupération interventions:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération'
      }
    });
  }
};

/**
 * @desc    Valider une intervention
 * @route   PATCH /api/orders/:id/validate
 * @access  Private (Admin uniquement)
 */
const validateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const adminId = req.user.userId;

    // Valider la mission
    const result = await orderService.validateOrder(orderId, adminId);
    const order = result.order; // ✅ EXTRAIRE order de l'objet result

    console.log('🔍 ORDER EXTRAIT:', order);
    console.log('🔍 order.prestataire_id:', order.prestataire_id); // ✅ Maintenant défini
    console.log('🔍 order.cemetery_name:', order.cemetery_name); // ✅ Maintenant défini

    // ✅ Créer une notification pour le prestataire
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      user_id: order.prestataire_id, // ✅ Maintenant disponible
      type: 'mission_validated',
      title: '✅ Mission validée - Paiement en cours',
      message: `Félicitations ! Votre mission au ${order.cemetery_name} a été validée par l'administrateur. Le paiement de ${(parseFloat(order.price) * 0.8).toFixed(2)}€ vous sera versé sous 48h.`,
      order_id: order.id
    });

    return res.status(200).json({
      success: true,
      data: result, // Retourne tout : order + transfer
      message: 'Intervention validée et paiement prestataire effectué'
    });

  } catch (error) {
    console.error('Erreur validation intervention:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la validation'
      }
    });
  }
};


/**
 * @desc    Récupérer les commandes en litige
 * @route   GET /api/orders/disputed
 * @access  Private (Admin uniquement)
 */
const getDisputedOrders = async (req, res) => {
  try {
    const orders = await orderService.getDisputedOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Erreur récupération litiges:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des litiges'
      }
    });
  }
};

/**
 * @desc    Marquer une commande comme litigieuse
 * @route   PATCH /api/orders/:id/dispute
 * @access  Private (Admin uniquement)
 */
const markAsDisputed = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const adminId = req.user.userId;

    // Validation du motif
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    // Marquer la commande comme litigieuse
    const order = await orderService.markOrderAsDisputed(orderId, adminId, reason);

    // ✅ Créer une notification pour le prestataire
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      user_id: order.prestataire_id,
      type: 'dispute',
      title: '🚨 Litige signalé sur votre mission',
      message: `Un problème a été signalé sur votre intervention au ${order.cemetery_name}. Motif : ${reason}. L'administrateur examine les photos et vous contactera si nécessaire.`,
      order_id: order.id
    });

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Commande marquée comme litigieuse'
    });

  } catch (error) {
    console.error('Erreur marquage litige:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors du marquage'
      }
    });
  }
};

/**
 * @desc    Résoudre un litige
 * @route   PATCH /api/orders/:id/resolve
 * @access  Private (Admin uniquement)
 */
const resolveDispute = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { action } = req.body;
    const adminId = req.user.userId;

    // Validation de l'action
    if (!['validate', 'refund', 'request_correction'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Action invalide. Utilisez: validate, refund ou request_correction'
        }
      });
    }

    // Résoudre le litige
    const order = await orderService.resolveDispute(orderId, adminId, action);

    // ✅ Créer une notification selon l'action choisie
    const notificationService = require('../services/notificationService');
    
    if (action === 'validate') {
      await notificationService.createNotification({
        user_id: order.prestataire_id,
        type: 'mission_validated',
        title: '✅ Litige résolu - Mission validée',
        message: `Le litige sur votre mission au ${order.cemetery_name} a été résolu en votre faveur. Le paiement de ${(parseFloat(order.price) * 0.8).toFixed(2)}€ vous sera versé sous 48h.`,
        order_id: order.id
      });
    } else if (action === 'refund') {
      await notificationService.createNotification({
        user_id: order.prestataire_id,
        type: 'dispute',
        title: '💸 Litige résolu - Remboursement client',
        message: `Le litige sur votre mission au ${order.cemetery_name} a été résolu en faveur du client. La commande a été remboursée. Vous ne serez pas rémunéré pour cette intervention.`,
        order_id: order.id
      });
    } else if (action === 'request_correction') {
      await notificationService.createNotification({
        user_id: order.prestataire_id,
        type: 'dispute',
        title: '🔄 Correction demandée',
        message: `L'administrateur demande une correction sur votre mission au ${order.cemetery_name}. Merci de retourner sur place pour effectuer les ajustements nécessaires.`,
        order_id: order.id
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Litige résolu avec succès'
    });

  } catch (error) {
    console.error('Erreur résolution litige:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la résolution'
      }
    });
  }
};

/**
 * @route   GET /api/orders/calendar/:prestatairId
 * @desc    Récupérer le calendrier d'un prestataire (admin)
 * @access  Private (Admin)
 */
const getProviderCalendarForAdmin = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { prestatairId } = req.params;
    
    const calendar = await orderService.getProviderCalendarForAdmin(adminId, prestatairId);

    return res.status(200).json({
      success: true,
      data: calendar,
      count: calendar.length
    });
  } catch (error) {
    console.error('Erreur calendrier admin:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

/**
 * @route   GET /api/orders/calendar
 * @desc    Récupérer le calendrier du prestataire
 * @access  Private (Prestataire)
 */
const getProviderCalendar = async (req, res) => {
  try {
    const prestatairId = req.user.userId;
    const calendar = await orderService.getProviderCalendar(prestatairId);

    return res.status(200).json({
      success: true,
      data: calendar,
      count: calendar.length
    });
  } catch (error) {
    console.error('Erreur calendrier:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

// Statistiques pour le dashboard client
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await orderRepository.getDashboardStats(userId);

    res.json(stats);
  } catch (err) {
    console.error('Erreur getDashboardStats:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des stats' });
  }
};

/**
 * @route   GET /api/orders/history
 * @desc    Récupérer l'historique des missions (prestataire)
 * @access  Private (Prestataire)
 */
const getProviderHistory = async (req, res) => {
  try {
    const prestatairId = req.user.userId;
    const history = await orderService.getProviderHistory(prestatairId);

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Erreur getProviderHistory:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAvailableOrders,
  acceptOrder,
  cancelOrder,
  completeOrder,
  getPendingValidation,
  validateOrder,
  getDisputedOrders,
  markAsDisputed,
  getDashboardStats,
  resolveDispute,
  getProviderHistory,
  getProviderCalendar,
  getProviderCalendarForAdmin
};
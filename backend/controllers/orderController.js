// backend/controllers/orderController.js
const orderService        = require('../services/orderService');
const notificationService = require('../services/notificationService');

/**
 * Contrôleur des commandes.
 * Responsabilité : extraire les données de req, appeler orderService, formater res.
 * Les notifications sont envoyées ici après chaque action métier réussie.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: fallbackMessage }
  });
};

/**
 * @desc    Crée une nouvelle commande après confirmation du paiement Stripe
 * @route   POST /api/orders
 * @access  Client uniquement
 */
const createOrder = async (req, res) => {
  try {
    const result = await orderService.createOrder(req.user.userId, req.body);

    return res.status(201).json({
      success: true,
      data:    result,
      message: 'Commande créée avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la création de la commande');
  }
};

/**
 * @desc    Récupère les commandes de l'utilisateur connecté (selon son rôle)
 * @route   GET /api/orders
 * @access  Tous rôles
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId, req.user.role);

    return res.status(200).json({
      success: true,
      count:   orders.length,
      data:    orders
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des commandes');
  }
};

/**
 * @desc    Récupère les détails d'une commande
 * @route   GET /api/orders/:id
 * @access  Tous rôles (filtré par ownership)
 */
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Commande introuvable' }
      });
    }

    return res.status(200).json({
      success: true,
      data:    order
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération de la commande');
  }
};

/**
 * @desc    Récupère les missions disponibles dans la zone du prestataire
 * @route   GET /api/orders/available
 * @access  Prestataire uniquement
 */
const getAvailableOrders = async (req, res) => {
  try {
    const orders = await orderService.getAvailableOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   orders.length,
      data:    orders
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des missions disponibles');
  }
};

/**
 * @desc    Accepte une mission avec date et heure planifiées
 * @route   PATCH /api/orders/:id/accept
 * @access  Prestataire uniquement
 */
const acceptOrder = async (req, res) => {
  try {
    const { scheduled_date, scheduled_time } = req.body;

    const order = await orderService.acceptOrder(
      req.params.id,
      req.user.userId,
      scheduled_date,
      scheduled_time
    );

    // Notifie le prestataire et le client en parallèle
    await Promise.all([
      notificationService.createNotification({
        user_id:  req.user.userId,
        type:     'schedule_needed',
        title:    '✅ Mission acceptée',
        message:  `Commande #${order.id.substring(0, 8)} — Vous avez accepté une mission au ${order.cemetery_name}. Intervention prévue le ${new Date(scheduled_date).toLocaleDateString('fr-FR')} à ${scheduled_time}.`,
        order_id: order.id
      }),
      notificationService.createNotification({
        user_id:  order.client_id,
        type:     'mission_accepted',
        title:    '✅ Votre mission a été acceptée',
        message:  `Un prestataire a accepté votre mission au ${order.cemetery_name}. Intervention prévue le ${new Date(scheduled_date).toLocaleDateString('fr-FR')}.`,
        order_id: order.id
      })
    ]);

    return res.status(200).json({
      success: true,
      data:    order,
      message: 'Mission acceptée et planifiée'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de l\'acceptation de la mission');
  }
};

/**
 * @desc    Marque une mission comme terminée côté prestataire
 * @route   PATCH /api/orders/:id/complete
 * @access  Prestataire uniquement
 */
const completeOrder = async (req, res) => {
  try {
    const result = await orderService.completeOrder(req.params.id, req.user.userId);

    await notificationService.createNotification({
      user_id:  result.client_id,
      type:     'photos_available',
      title:    '📷 Photos disponibles',
      message:  `Le prestataire a terminé l'intervention au ${result.cemetery_name}. Les photos avant/après sont disponibles.`,
      order_id: req.params.id
    });

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Mission terminée avec succès. En attente de validation.'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la complétion de la mission');
  }
};

/**
 * @desc    Annule une mission acceptée (prestataire uniquement)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Prestataire uniquement
 */
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    const result = await orderService.cancelOrder(req.params.id, req.user.userId, reason);

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Mission annulée avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de l\'annulation de la mission');
  }
};

/**
 * @desc    Récupère les commandes en attente de validation admin
 * @route   GET /api/orders/pending-validation
 * @access  Admin uniquement
 */
const getPendingValidation = async (req, res) => {
  try {
    const orders = await orderService.getPendingValidationOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   orders.length,
      data:    orders
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des validations en attente');
  }
};

/**
 * @desc    Valide une intervention et déclenche le paiement du prestataire
 * @route   PATCH /api/orders/:id/validate
 * @access  Admin uniquement
 */
const validateOrder = async (req, res) => {
  try {
    const result = await orderService.validateOrder(req.params.id, req.user.userId);
    const order  = result.order;

    // Notifie prestataire et client en parallèle
    await Promise.all([
      notificationService.createNotification({
        user_id:  order.prestataire_id,
        type:     'mission_validated',
        title:    '✅ Mission validée — Paiement en cours',
        message:  `Votre mission au ${order.cemetery_name} a été validée. Le paiement de ${(parseFloat(order.price) * 0.8).toFixed(2)}€ vous sera versé sous 48h.`,
        order_id: order.id
      }),
      notificationService.createNotification({
        user_id:  order.client_id,
        type:     'mission_completed',
        title:    '🎉 Mission validée',
        message:  `Votre mission au ${order.cemetery_name} a été validée. N'hésitez pas à évaluer le prestataire !`,
        order_id: order.id
      })
    ]);

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Intervention validée et paiement prestataire effectué'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la validation de l\'intervention');
  }
};

/**
 * @desc    Récupère les commandes en litige
 * @route   GET /api/orders/disputed
 * @access  Admin uniquement
 */
const getDisputedOrders = async (req, res) => {
  try {
    const orders = await orderService.getDisputedOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   orders.length,
      data:    orders
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des litiges');
  }
};

/**
 * @desc    Marque une commande comme litigieuse (admin)
 * @route   PATCH /api/orders/:id/dispute
 * @access  Admin uniquement
 */
const markAsDisputed = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    const order = await orderService.markOrderAsDisputed(
      req.params.id,
      req.user.userId,
      reason
    );

    await notificationService.createNotification({
      user_id:  order.prestataire_id,
      type:     'dispute',
      title:    '🚨 Litige signalé sur votre mission',
      message:  `Un problème a été signalé sur votre intervention au ${order.cemetery_name}. Motif : ${reason}. L'administrateur examine la situation.`,
      order_id: order.id
    });

    return res.status(200).json({
      success: true,
      data:    order,
      message: 'Commande marquée comme litigieuse'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors du marquage du litige');
  }
};

/**
 * @desc    Résout un litige avec trois actions possibles (admin)
 *          validate → paie le prestataire | refund → rembourse le client | request_correction → renvoie en cours
 * @route   PATCH /api/orders/:id/resolve
 * @access  Admin uniquement
 */
const resolveDispute = async (req, res) => {
  try {
    const { action } = req.body;

    if (!['validate', 'refund', 'request_correction'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_ACTION',
          message: 'Action invalide — valeurs acceptées : validate, refund, request_correction'
        }
      });
    }

    const result = await orderService.resolveDispute(req.params.id, req.user.userId, action);
    const order  = result.order;

    // Notifications selon l'action choisie
    const notifications = {
      validate: [
        {
          user_id:  order.prestataire_id,
          type:     'mission_validated',
          title:    '✅ Litige résolu — Mission validée',
          message:  `Le litige sur votre mission au ${order.cemetery_name} a été résolu en votre faveur. Paiement de ${(parseFloat(order.price) * 0.8).toFixed(2)}€ sous 48h.`,
          order_id: order.id
        },
        {
          user_id:  order.client_id,
          type:     'dispute_resolved',
          title:    '✅ Litige résolu',
          message:  `Votre litige concernant la mission au ${order.cemetery_name} a été examiné. L'intervention a été validée.`,
          order_id: order.id
        }
      ],
      refund: [
        {
          user_id:  order.prestataire_id,
          type:     'dispute',
          title:    '💸 Litige résolu — Remboursement client',
          message:  `Le litige sur votre mission au ${order.cemetery_name} a été résolu en faveur du client. Vous ne serez pas rémunéré pour cette intervention.`,
          order_id: order.id
        },
        {
          user_id:  order.client_id,
          type:     'refund_processed',
          title:    '💸 Remboursement effectué',
          message:  `Suite à votre signalement, vous avez été remboursé de ${order.price}€ pour la mission au ${order.cemetery_name}.`,
          order_id: order.id
        }
      ],
      request_correction: [
        {
          user_id:  order.prestataire_id,
          type:     'dispute',
          title:    '🔄 Correction demandée',
          message:  `L'administrateur demande une correction sur votre mission au ${order.cemetery_name}. Merci de retourner sur place effectuer les ajustements nécessaires.`,
          order_id: order.id
        },
        {
          user_id:  order.client_id,
          type:     'correction_requested',
          title:    '🔄 Correction en cours',
          message:  `Suite à votre signalement, une correction a été demandée au prestataire pour la mission au ${order.cemetery_name}.`,
          order_id: order.id
        }
      ]
    };

    await Promise.all(
      notifications[action].map(n => notificationService.createNotification(n))
    );

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Litige résolu avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la résolution du litige');
  }
};

/**
 * @desc    Récupère le calendrier des missions planifiées (prestataire)
 * @route   GET /api/orders/calendar
 * @access  Prestataire uniquement
 */
const getProviderCalendar = async (req, res) => {
  try {
    const calendar = await orderService.getProviderCalendar(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   calendar.length,
      data:    calendar
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération du calendrier');
  }
};

/**
 * @desc    Récupère le calendrier d'un prestataire spécifique (admin)
 * @route   GET /api/orders/calendar/:prestataireId
 * @access  Admin uniquement
 */
const getProviderCalendarForAdmin = async (req, res) => {
  try {
    const calendar = await orderService.getProviderCalendarForAdmin(
      req.user.userId,
      req.params.prestataireId
    );

    return res.status(200).json({
      success: true,
      count:   calendar.length,
      data:    calendar
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération du calendrier prestataire');
  }
};

/**
 * @desc    Récupère l'historique des missions terminées (prestataire)
 * @route   GET /api/orders/history
 * @access  Prestataire uniquement
 */
const getProviderHistory = async (req, res) => {
  try {
    const history = await orderService.getProviderHistory(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   history.length,
      data:    history
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération de l\'historique');
  }
};

/**
 * @desc    Récupère les statistiques du dashboard client
 * @route   GET /api/orders/dashboard-stats
 * @access  Client uniquement
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await orderService.getDashboardStats(req.user.userId);

    return res.status(200).json({
      success: true,
      data:    stats
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des statistiques');
  }
};

/**
 * @desc    Récupère les commandes terminées avec photos (client)
 * @route   GET /api/orders/completed-with-photos
 * @access  Client uniquement
 */
const getCompletedOrdersWithPhotos = async (req, res) => {
  try {
    const data = await orderService.getCompletedOrdersWithPhotos(req.user.userId);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des commandes avec photos');
  }
};

/**
 * @desc    Signale un litige sur une commande terminée (client uniquement)
 * @route   PATCH /api/orders/:orderId/report-dispute
 * @access  Client uniquement
 */
const reportDispute = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_REASON', message: 'Veuillez décrire le problème' }
      });
    }

    const result = await orderService.reportDispute(
      req.params.orderId,
      req.user.userId,
      reason.trim()
    );

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Litige signalé avec succès. Un administrateur va examiner votre demande.'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors du signalement du litige');
  }
};

/**
 * @desc    Annule une commande à la demande du client
 * @route   PATCH /api/orders/:id/cancel
 * @access  Client uniquement
 */
const cancelOrderClient = async (req, res) => {
  try {
    const order = await orderService.cancelOrderClient(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, data: order, message: 'Commande annulée' });
  } catch (error) {
    return handleError(error, res, "Erreur lors de l'annulation");
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
  resolveDispute,
  getProviderCalendar,
  getProviderCalendarForAdmin,
  getProviderHistory,
  getDashboardStats,
  getCompletedOrdersWithPhotos,
  reportDispute,
  cancelOrderClient
};
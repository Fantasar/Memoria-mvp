// backend/controllers/orderController.js
const orderService = require('../services/orderService');

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
      req.user.userId,  // Vient du middleware authenticateToken
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
    const orderId = req.params.id;
    const result = await orderService.acceptOrder(orderId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Mission acceptée avec succès'
    });

  } catch (error) {
    console.error('Erreur acceptation mission:', error);

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
        message: 'Erreur lors de l\'acceptation de la mission'
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


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAvailableOrders,
  acceptOrder
};
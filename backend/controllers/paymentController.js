// backend/controllers/paymentController.js
const stripeService = require('../services/stripeService');
const orderService = require('../services/orderService');

/**
 * CONTROLLER PAIEMENT
 * Responsabilité : Gestion des endpoints de paiement
 */

/**
 * @desc    Créer un Payment Intent Stripe + Commande
 * @route   POST /api/payments/create-payment-intent
 * @access  Private (Client uniquement)
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { cemetery_id, service_category_id, cemetery_location, price } = req.body;
    const clientId = req.user.userId;

    // Validation des données
    if (!cemetery_id || !service_category_id || !price) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Données manquantes (cemetery_id, service_category_id, price)',
        },
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRICE',
          message: 'Le prix doit être supérieur à 0',
        },
      });
    }

    // Créer le Payment Intent Stripe
    const paymentIntent = await stripeService.createPaymentIntent(price, {
      client_id: clientId,
      cemetery_id: cemetery_id.toString(),
      service_category_id: service_category_id.toString(),
      cemetery_location: cemetery_location || '',
    });

    // Retourner le client_secret au frontend
    return res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error('Erreur création Payment Intent:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_ERROR',
        message: 'Erreur lors de la création du paiement',
      },
    });
  }
};

/**
 * @desc    Confirmer le paiement et créer la commande
 * @route   POST /api/payments/confirm
 * @access  Private (Client uniquement)
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const clientId = req.user.userId;


    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PAYMENT_INTENT_ID',
          message: 'Payment Intent ID manquant',
        },
      });
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    // Vérifier que le paiement a réussi
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_SUCCEEDED',
          message: 'Le paiement n\'a pas abouti',
        },
      });
    }

    // Récupérer les métadonnées de la commande
    const { cemetery_id, service_category_id, cemetery_location } = paymentIntent.metadata;


    // Créer la commande en BDD
    const order = await orderService.createOrder(clientId, {
      cemetery_id: parseInt(cemetery_id),
      service_category_id: parseInt(service_category_id),
      cemetery_location: cemetery_location || null,
      price: paymentIntent.amount / 100, // Reconvertir centimes → euros
    });


    // Enregistrer le paiement dans la table payments
    // TODO: À implémenter si tu veux tracker les paiements

    return res.status(201).json({
      success: true,
      data: {
        order: order,
        paymentIntentId: paymentIntentId,
      },
      message: 'Commande créée et paiement confirmé',
    });
  } catch (error) {

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la confirmation du paiement',
      },
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
};
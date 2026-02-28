// backend/controllers/paymentController.js
const stripeService = require('../services/stripeService');
const orderService  = require('../services/orderService');
const serviceCategoryService = require('../services/serviceCategoryService');

/**
 * Contrôleur des paiements Stripe.
 * Responsabilité : orchestrer les deux étapes du tunnel de paiement.
 * Étape 1 — createPaymentIntent : récupère le prix et crée l'intention de paiement
 * Étape 2 — confirmPayment : vérifie le succès Stripe et crée la commande en base
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
 * @desc    Crée un PaymentIntent Stripe pour initier le paiement
 *          Le prix est récupéré depuis la BDD — jamais depuis le frontend
 * @route   POST /api/payments/create-payment-intent
 * @access  Client uniquement
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { cemetery_id, service_category_id, cemetery_location, comment } = req.body;

    if (!cemetery_id || !service_category_id) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_FIELDS',
          message: 'Données manquantes (cemetery_id, service_category_id)'
        }
      });
    }

    // Délègue la vérification du service et le calcul du prix au service
    const service = await serviceCategoryService.getServiceById(service_category_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: { code: 'SERVICE_NOT_FOUND', message: 'Service introuvable' }
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        success: false,
        error: { code: 'SERVICE_INACTIVE', message: 'Ce service n\'est plus disponible' }
      });
    }

    const price = parseFloat(service.base_price);
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PRICE', message: 'Prix du service invalide' }
      });
    }

    const paymentIntent = await stripeService.createPaymentIntent(price, {
      client_id:           req.user.userId.toString(),
      cemetery_id:         cemetery_id.toString(),
      service_category_id: service_category_id.toString(),
      cemetery_location:   cemetery_location || '',
      comment:             comment || ''
    });

    return res.status(200).json({
      success: true,
      data: {
        clientSecret:    paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount:          price
      }
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la création du paiement');
  }
};

/**
 * @desc    Confirme le paiement Stripe et crée la commande en base
 *          Appelé par le frontend après succès de stripe.confirmPayment()
 * @route   POST /api/payments/confirm
 * @access  Client uniquement
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_PAYMENT_INTENT_ID',
          message: 'Payment Intent ID manquant'
        }
      });
    }

    // Vérifie le statut du paiement directement auprès de Stripe
    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'PAYMENT_NOT_SUCCEEDED',
          message: 'Le paiement n\'a pas abouti'
        }
      });
    }

    // Récupère les données de commande depuis les métadonnées Stripe
    const { cemetery_id, service_category_id, cemetery_location, comment } = paymentIntent.metadata;

    // Le prix est récupéré depuis la BDD dans orderService — pas depuis Stripe
    const order = await orderService.createOrder(req.user.userId, {
      cemetery_id:         parseInt(cemetery_id),
      service_category_id: parseInt(service_category_id),
      cemetery_location:   cemetery_location || null,
      comment:             comment || null
    });

    return res.status(201).json({
      success: true,
      data: {
        order,
        paymentIntentId
      },
      message: 'Commande créée et paiement confirmé'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la confirmation du paiement');
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};
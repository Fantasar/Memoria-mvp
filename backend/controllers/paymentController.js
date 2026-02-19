const stripeService = require('../services/stripeService');
const orderService = require('../services/orderService');

/**
 * @desc    Créer un Payment Intent Stripe + Commande
 * @route   POST /api/payments/create-payment-intent
 * @access  Private (Client uniquement)
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { cemetery_id, service_category_id, cemetery_location } = req.body;
    const clientId = req.user.userId;

    // Validation des données
    if (!cemetery_id || !service_category_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Données manquantes (cemetery_id, service_category_id)',
        },
      });
    }

    // ✅ RÉCUPÉRER LE PRIX DEPUIS LA BDD (sécurisé)
    const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');
    const service = await serviceCategoryRepository.findById(service_category_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service introuvable',
        },
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_INACTIVE',
          message: 'Ce service n\'est plus disponible',
        },
      });
    }

    const price = parseFloat(service.base_price);

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRICE',
          message: 'Prix du service invalide',
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
        amount: price // ✅ Renvoyer le prix pour affichage
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

    // ✅ Créer la commande SANS envoyer le prix (il sera récupéré dans orderService)
    const order = await orderService.createOrder(clientId, {
      cemetery_id: parseInt(cemetery_id),
      service_category_id: parseInt(service_category_id),
      cemetery_location: cemetery_location || null
      // ✅ Le prix sera récupéré depuis la BDD dans orderService
    });

    return res.status(201).json({
      success: true,
      data: {
        order: order,
        paymentIntentId: paymentIntentId,
      },
      message: 'Commande créée et paiement confirmé',
    });
  } catch (error) {
    console.error('Erreur confirmPayment:', error);

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
// frontend/src/components/orders/CheckoutForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

/**
 * Formulaire de paiement Stripe — étape finale du tunnel de commande.
 *
 * Flux en 3 étapes :
 * 1. Confirmation du paiement côté Stripe (carte, 3DS...)
 * 2. Vérification du statut du PaymentIntent
 * 3. Confirmation côté backend pour créer la commande en BDD
 *
 * @param {string} paymentIntentId - ID du PaymentIntent Stripe (créé côté backend)
 * @param {Object} orderData       - Données de la commande (price, service...)
 */
function CheckoutForm({ paymentIntentId, orderData }) {
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isProcessing,  setIsProcessing]  = useState(false);
  const [errorMessage,  setErrorMessage]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // Étape 1 — Confirmation du paiement côté Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/success`
      },
      redirect: 'if_required'
    });

    if (stripeError) {
      setErrorMessage(stripeError.message);
      setIsProcessing(false);
      return;
    }

    // Étape 2 — Vérification du statut du PaymentIntent
    if (paymentIntent.status !== 'succeeded') {
      setErrorMessage(`Le paiement n'a pas abouti (statut : ${paymentIntent.status})`);
      setIsProcessing(false);
      return;
    }

    // Étape 3 — Confirmation côté backend et création de la commande en BDD
    try {
      const response = await axios.post(
        `/api/payments/confirm`,
        { paymentIntentId: paymentIntent.id },
        {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        navigate('/dashboard/client', {
          state: { message: '✅ Commande créée et paiement confirmé avec succès !' }
        });
      }
    } catch (err) {
      // Le paiement Stripe a réussi mais la commande n'a pas été créée en BDD
      // L'utilisateur doit contacter le support avec son PaymentIntent ID
      const detail = err.response?.data?.error?.message;
      setErrorMessage(
        detail
          ? `Paiement réussi mais erreur : ${detail}`
          : 'Paiement réussi mais erreur lors de la création de la commande. Contactez le support.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Informations de paiement
      </h2>

      {/* Formulaire Stripe — carte, Apple Pay, etc. */}
      <div className="mb-6">
        <PaymentElement />
      </div>

      {/* Erreur de paiement */}
      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Traitement en cours...' : `Payer ${orderData?.price?.toFixed(2)} €`}
      </button>

      <div className="mt-4 text-center text-xs text-gray-500">
        🔒 Paiement sécurisé par Stripe
      </div>
    </form>
  );
}

export default CheckoutForm;
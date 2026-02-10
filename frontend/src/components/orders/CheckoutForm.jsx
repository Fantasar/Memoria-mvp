// frontend/src/components/orders/CheckoutForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_URL from '../../config/api';

function CheckoutForm({ paymentIntentId, orderData }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // ============ ÉTAPE 1 : CONFIRMER LE PAIEMENT AVEC STRIPE ============
    
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/success`,
      },
      redirect: 'if_required',
    });

    // Erreur Stripe (carte refusée, etc.)
    if (stripeError) {
      console.error('❌ Erreur Stripe:', stripeError);
      setErrorMessage(stripeError.message);
      setIsProcessing(false);
      return;
    }

    // ============ ÉTAPE 2 : VÉRIFIER QUE LE PAIEMENT A RÉUSSI ============

    console.log('✅ Payment Intent confirmé:', paymentIntent);

    if (paymentIntent.status !== 'succeeded') {
      console.error('❌ Paiement non réussi:', paymentIntent.status);
      setErrorMessage(`Le paiement n'a pas abouti (statut: ${paymentIntent.status})`);
      setIsProcessing(false);
      return;
    }

    // ============ ÉTAPE 3 : CRÉER LA COMMANDE EN BDD ============

    try {
      const response = await axios.post(
        `${API_URL}/api/payments/confirm`,
        { paymentIntentId: paymentIntent.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ Commande créée:', response.data);
        
        // Redirection vers dashboard avec message de succès
        navigate('/dashboard/client', {
          state: {
            message: '✅ Commande créée et paiement confirmé avec succès !',
          },
        });
      }
    } catch (err) {
      console.error('❌ Erreur confirmation commande:', err);
      
      if (err.response?.data?.error) {
        setErrorMessage(`Paiement réussi mais erreur : ${err.response.data.error.message}`);
      } else {
        setErrorMessage('Paiement réussi mais erreur lors de la création de la commande. Contactez le support.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Informations de paiement
      </h2>

      {/* Stripe Payment Element */}
      <div className="mb-6">
        <PaymentElement />
      </div>

      {/* Message d'erreur */}
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

      {/* Info sécurité */}
      <div className="mt-4 text-center text-xs text-gray-500">
        🔒 Paiement sécurisé par Stripe
      </div>
    </form>
  );
}

export default CheckoutForm;
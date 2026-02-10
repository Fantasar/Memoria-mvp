// frontend/src/pages/orders/Checkout.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../../config/stripe';
import CheckoutForm from '../../components/orders/CheckoutForm';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_URL from '../../config/api';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données de la commande depuis la navigation
  const orderData = location.state?.orderData;

  // Si pas de données, rediriger
  useEffect(() => {
    if (!orderData) {
      navigate('/orders/new');
    }
  }, [orderData, navigate]);

  // ============ CRÉER PAYMENT INTENT ============

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);

        const response = await axios.post(
          `${API_URL}/api/payments/create-payment-intent`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setClientSecret(response.data.data.clientSecret);
          setPaymentIntentId(response.data.data.paymentIntentId);
        }

        setError(null);
      } catch (err) {
        console.error('Erreur création Payment Intent:', err);
        setError('Impossible de créer le paiement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (orderData && token) {
      createPaymentIntent();
    }
  }, [orderData, token]);

  // ============ OPTIONS STRIPE ELEMENTS ============

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // ============ RENDER LOADING ============

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Préparation du paiement...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ERREUR ============

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => navigate('/orders/new')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6"
          >
            ← Retour au formulaire
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ RENDER CHECKOUT ============

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders/new')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour au formulaire
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Paiement</h1>
          <p className="text-gray-600 mt-2">Finalisez votre commande</p>
        </div>

        {/* Récapitulatif commande */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Montant à payer</span>
              <span className="font-bold text-2xl text-blue-600">
                {orderData?.price?.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire Stripe */}
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              clientSecret={clientSecret}
              paymentIntentId={paymentIntentId}
              orderData={orderData}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default Checkout;
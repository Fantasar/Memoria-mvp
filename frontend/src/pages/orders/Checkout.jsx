// frontend/src/pages/orders/Checkout.jsx
import { useState, useEffect }        from 'react';
import { useLocation, useNavigate }   from 'react-router-dom';
import { Elements }                   from '@stripe/react-stripe-js';
import stripePromise                  from '../../config/stripe';
import CheckoutForm                   from '../../components/orders/CheckoutForm';
import { useAuth }                    from '../../hooks/useAuth';
import axios                          from 'axios';

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: { colorPrimary: '#2563eb' },
};

function Checkout() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { token }  = useAuth();

  const [clientSecret,    setClientSecret]    = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [amount,          setAmount]          = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  const orderData = location.state?.orderData;

  // Redirection si pas de données commande
  useEffect(() => {
    if (!orderData) navigate('/orders/new');
  }, [orderData, navigate]);

  // Créer le Payment Intent
  useEffect(() => {
    if (!orderData || !token) return;

    const createPaymentIntent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          '/api/payments/create-payment-intent',
          {
            cemetery_id:          orderData.cemetery_id,
            service_category_id:  orderData.service_category_id,
            cemetery_location:    orderData.cemetery_location,
          },
          {
            headers: {
              Authorization:  `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (res.data.success) {
          setClientSecret(res.data.data.clientSecret);
          setPaymentIntentId(res.data.data.paymentIntentId);
          setAmount(res.data.data.amount);
        }
      } catch {
        setError('Impossible de créer le paiement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderData, token]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Préparation du paiement...</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => navigate('/orders/new')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6">
            ← Retour au formulaire
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-800">{error}</p>
            <button onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checkout ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        <div className="mb-6">
          <button onClick={() => navigate('/orders/new')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← Retour au formulaire
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Paiement</h1>
          <p className="text-gray-600 mt-2">Finalisez votre commande</p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Montant à payer</span>
            <span className="font-bold text-2xl text-blue-600">
              {amount ? amount.toFixed(2) : '0.00'} €
            </span>
          </div>
        </div>

        {/* Stripe Elements */}
        {clientSecret && (
          <Elements options={{ clientSecret, appearance: STRIPE_APPEARANCE }} stripe={stripePromise}>
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
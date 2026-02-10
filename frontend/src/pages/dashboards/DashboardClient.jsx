// frontend/src/pages/dashboards/DashboardClient.jsx
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import OrderListPreview from '../../components/orders/OrderListPreview';

function DashboardClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  // Afficher message de succès si redirection depuis NewOrder
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Effacer le message après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Dashboard Client</h1>
            <button
              onClick={() => navigate('/orders/new')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Nouvelle commande
            </button>
          </div>

          {/* Message de succès */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">✅ {successMessage}</p>
            </div>
          )}
          
          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-700">
                Bienvenue <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          )}

          {/* ✨ PREVIEW DES 5 DERNIÈRES COMMANDES ✨ */}
          <OrderListPreview />
        </div>
      </main>
    </div>
  );
}

export default DashboardClient;
// frontend/src/components/orders/OrderListPreview.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_URL from '../../config/api';

function OrderListPreview() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============ CHARGEMENT DES 5 DERNIÈRES COMMANDES ============

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Garder seulement les 5 dernières
          setOrders(response.data.data.slice(0, 5));
        }
        setError(null);

      } catch (err) {
        console.error('Erreur récupération commandes:', err);
        setError('Impossible de charger vos commandes.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  // ============ FONCTION BADGE STATUT ============

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'En attente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      accepted: {
        label: 'Acceptée',
        className: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      in_progress: {
        label: 'En cours',
        className: 'bg-purple-100 text-purple-800 border-purple-300'
      },
      completed: {
        label: 'Terminée',
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      validated: {
        label: 'Validée',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      },
      cancelled: {
        label: 'Annulée',
        className: 'bg-red-100 text-red-800 border-red-300'
      }
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // ============ FORMATER DATE ============

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ============ RENDER LOADING ============

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement...</p>
      </div>
    );
  }

  // ============ RENDER ERREUR ============

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  // ============ RENDER VIDE ============

  if (orders.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-blue-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune commande
        </h3>
        <p className="text-gray-600 text-sm">
          Créez votre première commande pour commencer !
        </p>
      </div>
    );
  }

  // ============ RENDER LISTE PREVIEW ============

  return (
    <div className="space-y-4">
      {/* Header avec lien vers historique complet */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Dernières commandes
        </h2>
        <button
          onClick={() => navigate('/orders/history')}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
        >
          Voir tout l'historique
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {order.service_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  📍 {order.cemetery_name} - {order.cemetery_city}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(order.created_at)}
                </p>
              </div>
              
              {/* Badges */}
              <div className="ml-4 flex gap-2 flex-col items-end">
                {getStatusBadge(order.status)}
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Payé
                </span>
              </div>
            </div>

            {/* Prix */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant</span>
                <span className="font-bold text-blue-600">
                  {parseFloat(order.price).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderListPreview;
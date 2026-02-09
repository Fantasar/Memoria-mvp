// frontend/src/pages/orders/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_URL from '../../config/api';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============ CHARGEMENT COMMANDE ============

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setOrder(response.data.data);
        }
        setError(null);

      } catch (err) {
        console.error('Erreur récupération commande:', err);
        
        if (err.response?.status === 404) {
          setError('Commande introuvable');
        } else if (err.response?.status === 403) {
          setError('Vous n\'avez pas accès à cette commande');
        } else {
          setError('Impossible de charger les détails de la commande');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchOrder();
    }
  }, [id, token]);

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
      <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // ============ FORMATER DATE ============

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============ RENDER LOADING ============

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ERREUR ============

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6"
          >
            ← Retour au dashboard
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur</h3>
            <p className="text-red-700">{error || 'Commande introuvable'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ RENDER DETAILS ============

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour à mes commandes
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Détails de la commande</h1>
              <p className="text-gray-600 mt-1">Commande #{order.id.slice(0, 8)}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          
          {/* Section Service */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service commandé</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Type de service</p>
                <p className="text-lg font-semibold text-gray-900">{order.service_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="text-2xl font-bold text-blue-600">
                  {parseFloat(order.price).toFixed(2)} €
                </p>
              </div>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Cimetière</p>
                <p className="font-semibold text-gray-900">
                  📍 {order.cemetery_name}
                </p>
                <p className="text-sm text-gray-600">{order.cemetery_city}</p>
              </div>
              {order.cemetery_location && (
                <div>
                  <p className="text-sm text-gray-600">Emplacement précis</p>
                  <p className="text-gray-900">{order.cemetery_location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Dates */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dates importantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de création</p>
                <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
              </div>
              {order.accepted_at && (
                <div>
                  <p className="text-sm text-gray-600">Date d'acceptation</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.accepted_at)}</p>
                </div>
              )}
              {order.completed_at && (
                <div>
                  <p className="text-sm text-gray-600">Date de réalisation</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.completed_at)}</p>
                </div>
              )}
              {order.validated_at && (
                <div>
                  <p className="text-sm text-gray-600">Date de validation</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.validated_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Prestataire */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prestataire</h2>
            {order.prestataire_email ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">✅ Prestataire assigné</p>
                <p className="font-semibold text-gray-900">{order.prestataire_email}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">⏳ En attente d'un prestataire</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Votre commande sera bientôt prise en charge par un prestataire de votre zone.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Bouton d'action (optionnel) */}
        {order.status === 'pending' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Bon à savoir :</strong> Vous serez notifié par email dès qu'un prestataire acceptera votre commande.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default OrderDetails;
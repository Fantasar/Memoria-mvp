import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrderListFull({ onReview }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ AJOUTE CES STATES
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderPhotos, setOrderPhotos] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState({});

  // Badges de statut
  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Payée', color: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800' },
    in_progress: { label: 'En cours', color: 'bg-purple-100 text-purple-800' },
    awaiting_validation: { label: 'En attente validation', color: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Terminée', color: 'bg-green-200 text-green-900' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
    disputed: { label: 'Litige en cours', color: 'bg-red-100 text-red-800' },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FONCTION POUR RÉCUPÉRER LES PHOTOS
  const fetchPhotos = async (orderId) => {
    if (orderPhotos[orderId]) {
      // Déjà chargées, juste toggle l'affichage
      setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
      return;
    }

    setLoadingPhotos(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/photos/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrderPhotos(prev => ({ ...prev, [orderId]: response.data.data || [] }));
      setExpandedOrderId(orderId);
    } catch (err) {
      console.error('Erreur photos:', err);
      alert('Erreur lors du chargement des photos');
    } finally {
      setLoadingPhotos(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-lg mb-4">Aucune commande pour le moment</p>
        <button 
          onClick={() => navigate('/orders/new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Créer ma première commande
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const photos = orderPhotos[order.id] || [];
        const beforePhoto = photos.find(p => p.type === 'before');
        const afterPhoto = photos.find(p => p.type === 'after');
        const isExpanded = expandedOrderId === order.id;

        return (
          <div 
            key={order.id} 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Partie cliquable pour navigation */}
            <div 
              className="cursor-pointer p-6"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between">
                
                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.service_name || 'Service non défini'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">📍 Cimetière :</span> {order.cemetery_name || 'Non spécifié'}
                    </div>
                    <div>
                      <span className="font-medium">📅 Date :</span> {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">💰 Prix :</span> {order.price ? `${order.price}€` : 'Non défini'}
                    </div>
                    {order.prestataire_email && (
                      <div>
                        <span className="font-medium">👤 Prestataire :</span> {order.prestataire_email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Flèche */}
                <div className="ml-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

              </div>
            </div>

            {/* ✅ ACTIONS (missions terminées ou en attente validation) */}
            {(order.status === 'completed' || order.status === 'awaiting_validation' || order.status === 'disputed') && (
              <div className="px-6 pb-4 pt-0 border-t border-gray-200">
                <div className="flex gap-2 mt-4">
                  {/* Bouton Voir les photos */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchPhotos(order.id);
                    }}
                    disabled={loadingPhotos[order.id]}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                  >
                    {loadingPhotos[order.id] ? '⏳ Chargement...' : isExpanded ? '🔼 Masquer photos' : '📷 Voir les photos'}
                  </button>

                  {/* Bouton Évaluer (uniquement si completed) */}
                  {order.status === 'completed' && (
                    !order.has_review ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReview(order);
                        }}
                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-medium"
                      >
                        ⭐ Évaluer
                      </button>
                    ) : (
                      <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium">
                        ✅ Évalué
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ✅ AFFICHAGE DES PHOTOS */}
            {isExpanded && photos.length > 0 && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Photo avant */}
                  {beforePhoto && (
                    <div className="relative">
                      <img 
                        src={beforePhoto.url} 
                        alt="Avant" 
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <span className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
                        📷 Avant
                      </span>
                    </div>
                  )}

                  {/* Photo après */}
                  {afterPhoto && (
                    <div className="relative">
                      <img 
                        src={afterPhoto.url} 
                        alt="Après" 
                        className="w-full h-64 object-cover rounded-lg border-2 border-green-200"
                      />
                      <span className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded text-sm font-medium">
                        ✨ Après
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isExpanded && photos.length === 0 && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                  Aucune photo disponible pour cette intervention
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default OrderListFull;
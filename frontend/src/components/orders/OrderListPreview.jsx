import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderListPreview({ onReview }) { // ✅ Garde la prop onReview
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Payée', color: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800' },
    in_progress: { label: 'En cours', color: 'bg-purple-100 text-purple-800' },
    awaiting_validation: { label: 'En attente validation', color: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Terminée', color: 'bg-green-200 text-green-900' },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Erreur');

        const data = await response.json();
        // Ne garder que les 3 dernières commandes
        setOrders((data.data || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">Aucune commande récente</p>
        <button 
          onClick={() => navigate('/orders/new')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Créer une commande
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Commandes récentes</h3>

      <div className="space-y-3">
        {orders.map(order => (
          <div 
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            {/* ✅ Contenu cliquable pour voir les détails */}
            <div 
              className="cursor-pointer"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {order.service_name || 'Service'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.color || 'bg-gray-100'}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.cemetery_name} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.price}€</p>
                </div>
              </div>
            </div>

            {/* ✅ BOUTON ÉVALUER (missions terminées uniquement) */}
            {order.status === 'completed' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                {!order.has_review ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la navigation
                      onReview(order);
                    }}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-medium text-sm"
                  >
                    ⭐ Évaluer cette mission
                  </button>
                ) : (
                  <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium text-sm">
                    ✅ Évaluation envoyée
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderListPreview;
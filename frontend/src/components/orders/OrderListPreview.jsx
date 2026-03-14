// frontend/src/components/orders/OrderListPreview.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_CONFIG = {
  pending:              { label: 'En attente',            color: 'bg-yellow-100 text-yellow-800' },
  paid:                 { label: 'Payée',                 color: 'bg-blue-100 text-blue-800'     },
  accepted:             { label: 'Acceptée',              color: 'bg-green-100 text-green-800'   },
  in_progress:          { label: 'En cours',              color: 'bg-purple-100 text-purple-800' },
  awaiting_validation:  { label: 'En attente validation', color: 'bg-orange-100 text-orange-800' },
  correction_requested: { label: 'Correction demandée',   color: 'bg-orange-100 text-orange-800' },
  completed:            { label: 'Terminée',              color: 'bg-green-100 text-green-800'   },
  cancelled:            { label: 'Annulée',               color: 'bg-red-100 text-red-800'       },
  disputed:             { label: 'Litige en cours',       color: 'bg-red-100 text-red-800'       },
  refunded:             { label: 'Remboursée',            color: 'bg-gray-100 text-gray-800'     },
};

/**
 * Aperçu des 3 dernières commandes en grid 3 colonnes.
 * Affiché dans l'overview du dashboard client.
 *
 * @param {Function} onReview              - Callback déclenché au clic sur "Évaluer"
 * @param {Function} onNavigateToOrders    - Callback pour naviguer vers la section historique
 */
function OrderListPreview({ onReview, onNavigateToOrders }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Aperçu limité aux 3 dernières commandes
        setOrders((response.data.data || []).slice(0, 3));
      } catch {
        // Échec silencieux — affiche l'état vide
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
        <p className="text-gray-500 mb-4">Aucune commande récente</p>
        <button
          onClick={() => navigate('/orders/new')}
          className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm"
        >
          Créer une commande
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Commandes récentes</h3>
        <button
          onClick={onNavigateToOrders}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium transition"
        >
          Voir tout →
        </button>
      </div>

      {/* Grid 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => {
          const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col"
            >
              {/* Zone cliquable */}
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-semibold text-gray-900 text-sm leading-tight">
                    {order.service_name || 'Service'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{order.cemetery_name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
                <p className="text-base font-bold text-gray-900 mt-3">{order.price}€</p>
              </div>

              {/* Bouton évaluation — missions terminées uniquement */}
              {order.status === 'completed' && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {!order.has_review ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onReview(order); }}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                    >
                      Évaluer cette mission
                    </button>
                  ) : (
                    <div className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-medium text-sm border border-green-100">
                      Évaluation envoyée
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderListPreview;
// frontend/src/pages/orders/OrderDetails.jsx
import { useState, useEffect }        from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import { useAuth }                    from '../../hooks/useAuth';
import axios                          from 'axios';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:      { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300'   },
  accepted:     { label: 'Acceptée',   className: 'bg-blue-100 text-blue-800 border-blue-300'         },
  in_progress:  { label: 'En cours',   className: 'bg-purple-100 text-purple-800 border-purple-300'   },
  completed:    { label: 'Terminée',   className: 'bg-green-100 text-green-800 border-green-300'       },
  validated:    { label: 'Validée',    className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  cancelled:    { label: 'Annulée',    className: 'bg-red-100 text-red-800 border-red-300'             },
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
  return (
    <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
function OrderDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { token }  = useAuth();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!token || !id) return;

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setOrder(res.data.data);
      } catch (err) {
        const status = err.response?.status;
        if      (status === 404) setError('Commande introuvable');
        else if (status === 403) setError("Vous n'avez pas accès à cette commande");
        else                     setError('Impossible de charger les détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6">
            ← Retour au dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur</h3>
            <p className="text-red-700">{error || 'Commande introuvable'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dates à afficher conditionnellement ───────────────────────────────────
  const DATES = [
    { label: 'Date de création',    value: order.created_at   },
    { label: "Date d'acceptation",  value: order.accepted_at  },
    { label: 'Date de réalisation', value: order.completed_at },
    { label: 'Date de validation',  value: order.validated_at },
  ].filter(d => d.value);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← Retour à mes commandes
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Détails de la commande</h1>
              <p className="text-gray-600 mt-1">Commande #{order.id.slice(0, 8)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">

          {/* Service */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service commandé</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Type de service</p>
                <p className="text-lg font-semibold text-gray-900">{order.service_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="text-2xl font-bold text-blue-600">{parseFloat(order.price).toFixed(2)} €</p>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Cimetière</p>
                <p className="font-semibold text-gray-900"> {order.cemetery_name}</p>
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

          {/* Dates */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dates importantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATES.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="font-semibold text-gray-900">{formatDate(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prestataire */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prestataire</h2>
            {order.prestataire_email ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2"> Prestataire assigné</p>
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

        {/* Info statut pending */}
        {order.status === 'pending' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
               <strong>Bon à savoir :</strong> Vous serez notifié par email dès qu'un prestataire acceptera votre commande.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default OrderDetails;
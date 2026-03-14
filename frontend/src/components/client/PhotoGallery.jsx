// frontend/src/components/clients/PhotoGallery.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

/** Génère les headers d'authentification JWT depuis le localStorage */
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

/**
 * Galerie des interventions terminées avec photos avant/après.
 * Permet au client de consulter les résultats, signaler un litige et évaluer le prestataire.
 */
function PhotoGallery() {
  const [orders,           setOrders]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedPhoto,    setSelectedPhoto]    = useState(null);
  const [selectedOrder,    setSelectedOrder]    = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason,    setDisputeReason]    = useState('');
  const [submitting,       setSubmitting]       = useState(false);

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/gallery', authHeaders());
      setOrders(response.data.data || []);
    } catch {
      // Échec silencieux
    } finally {
      setLoading(false);
    }
  };

  const openDisputeModal  = (order) => { setSelectedOrder(order); setShowDisputeModal(true); };
  const closeDisputeModal = () => { setShowDisputeModal(false); setSelectedOrder(null); setDisputeReason(''); };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    try {
      await axios.patch(`/api/orders/${selectedOrder.id}/report-dispute`, { reason: disputeReason.trim() }, authHeaders());
      closeDisputeModal();
      await fetchGallery();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
      <p className="text-gray-600 font-medium">Aucune intervention terminée</p>
      <p className="text-sm text-gray-400 mt-2">Vos photos avant/après apparaîtront ici une fois les missions terminées</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Galerie de mes interventions</h2>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} intervention{orders.length > 1 ? 's' : ''} terminée{orders.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map(order => {
          const beforePhoto = order.photos.find(p => p.type === 'before');
          const afterPhoto  = order.photos.find(p => p.type === 'after');
          const isDisputed  = order.status === 'disputed';

          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">

              {/* En-tête — bg-blue-500 uniforme (plus de dégradé) */}
              <div className="bg-blue-500 text-white p-4">
                <h3 className="font-semibold">{order.service_name}</h3>
                <p className="text-sm text-blue-100">{order.cemetery_name}</p>
                <p className="text-xs text-blue-200 mt-1">
                  {new Date(order.scheduled_date || order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>

              {/* Photos avant/après */}
              <div className="grid grid-cols-2 gap-2 p-4">
                {beforePhoto && (
                  <div onClick={() => setSelectedPhoto(beforePhoto)}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg">
                    <img src={beforePhoto.url} alt="Avant intervention"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end p-3">
                      <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">Avant</span>
                    </div>
                  </div>
                )}
                {afterPhoto && (
                  <div onClick={() => setSelectedPhoto(afterPhoto)}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg">
                    <img src={afterPhoto.url} alt="Après intervention"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end p-3">
                      <span className="bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded text-sm font-medium">Après</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2">
                {order.status === 'completed' && !isDisputed && (
                  <button onClick={() => openDisputeModal(order)}
                    className="flex-1 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-100 transition font-medium text-sm">
                    Signaler un problème
                  </button>
                )}
                {isDisputed && (
                  <div className="flex-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg text-center font-medium text-sm">
                    Litige en cours
                  </div>
                )}
                {!order.has_review ? (
                  <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition font-medium text-sm">
                    Évaluer
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-lg text-center font-medium text-sm">
                    Évalué
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition z-10 text-lg font-bold">
              ×
            </button>
            <img src={selectedPhoto.url}
              alt={selectedPhoto.type === 'before' ? 'Avant intervention' : 'Après intervention'}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
              {selectedPhoto.type === 'before' ? 'Photo avant intervention' : 'Photo après intervention'}
            </div>
          </div>
        </div>
      )}

      {/* Modal litige */}
      {showDisputeModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Signaler un problème</h3>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-orange-700 mb-1">Intervention concernée</p>
              <p className="font-semibold text-gray-800">{selectedOrder.service_name}</p>
              <p className="text-sm text-gray-500">{selectedOrder.cemetery_name}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Décrivez le problème *</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Ex: La tombe n'a pas été correctement nettoyée..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows="4" maxLength="500" />
              <p className="text-xs text-gray-400 mt-1 text-right">{disputeReason.length}/500 caractères</p>
            </div>
            <div className="flex gap-3">
              <button onClick={closeDisputeModal} disabled={submitting}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmitDispute} disabled={submitting || !disputeReason.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Envoi...' : 'Signaler le problème'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;
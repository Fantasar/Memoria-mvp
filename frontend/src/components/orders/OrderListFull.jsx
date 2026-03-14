// frontend/src/components/orders/OrderListFull.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../hooks/useAuth';
import logoMemoria from '../../assets/Logos-Mémoria.jpeg';

const STATUS_CONFIG = {
  pending:              { label: 'En attente',            color: 'bg-yellow-100 text-yellow-800' },
  paid:                 { label: 'Payée',                 color: 'bg-blue-100 text-blue-800'     },
  accepted:             { label: 'Acceptée',              color: 'bg-green-100 text-green-800'   },
  in_progress:          { label: 'En cours',              color: 'bg-purple-100 text-purple-800' },
  awaiting_validation:  { label: 'En attente validation', color: 'bg-orange-100 text-orange-800' },
  correction_requested: { label: 'Correction demandée',   color: 'bg-orange-100 text-orange-800' },
  completed:            { label: 'Terminée',              color: 'bg-green-100 text-green-800'   },
  cancelled:            { label: 'Annulée',               color: 'bg-red-100 text-red-800'       },
  refunded:             { label: 'Remboursée',            color: 'bg-gray-100 text-gray-800'     },
  disputed:             { label: 'Litige en cours',       color: 'bg-red-100 text-red-800'       },
};

const PHOTO_STATUSES = ['completed', 'awaiting_validation', 'disputed'];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

/**
 * Historique complet des commandes client en grid 3 colonnes.
 * Photos chargées à la demande et mises en cache dans orderPhotos.
 *
 * @param {Function} onReview - Callback déclenché au clic sur "Évaluer"
 */
function OrderListFull({ onReview }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderPhotos,   setOrderPhotos]   = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState({});
  const [cancelError,   setCancelError]   = useState({});
  const [cancelling,    setCancelling]    = useState({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders', authHeaders());
      setOrders(response.data.data || []);
    } catch {
      setError('Impossible de charger vos commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les photos d'une commande à la demande avec mise en cache.
   * Toggle l'affichage si déjà chargées.
   */
  const fetchPhotos = async (orderId) => {
    if (orderPhotos[orderId] !== undefined) {
      setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
      return;
    }
    setLoadingPhotos(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.get(`/api/photos/order/${orderId}`, authHeaders());
      setOrderPhotos(prev => ({ ...prev, [orderId]: response.data.data || [] }));
      setExpandedOrderId(orderId);
    } catch {
      setOrderPhotos(prev => ({ ...prev, [orderId]: [] }));
    } finally {
      setLoadingPhotos(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setCancelling(prev => ({ ...prev, [orderId]: true }));
    setCancelError(prev => ({ ...prev, [orderId]: null }));
    try {
      await axios.patch(`/api/orders/${orderId}/cancel-client`, {}, authHeaders());
      fetchOrders();
    } catch (err) {
      setCancelError(prev => ({
        ...prev,
        [orderId]: err.response?.data?.error?.message || "Erreur lors de l'annulation"
      }));
    } finally {
      setCancelling(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const loadImageAsBase64 = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
    });

  const exportFacturePDF = async (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const mainColor = [59, 130, 246];
    const today = new Date().toLocaleDateString('fr-FR');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
    const logoBase64 = await loadImageAsBase64(logoMemoria);

    doc.setFillColor(...mainColor);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 7, 22, 22);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MÉMORIA', pageWidth / 2, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Facture de prestation', pageWidth / 2, 25, { align: 'center' });

    let y = 50;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Client : ${user.prenom} ${user.nom}`, 15, y); y += 7;
    doc.text(`Email : ${user.email}`, 15, y); y += 7;
    doc.text(`Téléphone : ${user.telephone || 'Non renseigné'}`, 15, y); y += 7;
    doc.text(`Date de facture : ${today}`, 15, y); y += 15;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nous vous remercions de votre confiance et de votre commande sur la plateforme Mémoria.', 15, y, { maxWidth: pageWidth - 30 }); y += 8;
    doc.text('Notre équipe reste disponible pour toute question ou besoin complémentaire.', 15, y, { maxWidth: pageWidth - 30 }); y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    autoTable(doc, {
      startY: y,
      head: [['Champ', 'Détail']],
      body: [
        ['Numéro de commande', order.id],
        ['Date de commande',   formatDate(order.created_at)],
        ['Service',            order.service_name || '-'],
        ['Cimetière',          order.cemetery_name || '-'],
        ['Lieu',               order.cemetery_city || '-'],
        ['Statut',             order.status === 'completed' ? 'Terminée' : 'Payée'],
        ['Montant réglé',      order.price ? `${order.price} €` : '-'],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: mainColor, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { fontStyle: 'bold' } }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Mémoria © ${new Date().getFullYear()} — Page ${i}/${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`memoria-facture-${order.id.slice(0, 8)}.pdf`);
  };

  // ─── États de chargement / erreur / vide ─────────────────────────────────

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-red-800 text-sm">{error}</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
      <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-600 text-lg mb-4">Aucune commande pour le moment</p>
      <button onClick={() => navigate('/orders/new')}
        className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition text-sm">
        Créer ma première commande
      </button>
    </div>
  );

  // ─── Rendu principal — grid 3 colonnes ───────────────────────────────────

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {orders.map(order => {
        const photos      = orderPhotos[order.id] || [];
        const beforePhoto = photos.find(p => p.type === 'before');
        const afterPhoto  = photos.find(p => p.type === 'after');
        const isExpanded  = expandedOrderId === order.id;
        const statusCfg   = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };

        return (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col">

            {/* Zone cliquable — infos commande */}
            <div className="flex-1 cursor-pointer p-5" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                  {order.service_name || 'Service'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <p><span className="font-medium text-gray-600">Cimetière :</span> {order.cemetery_name || '-'}</p>
                <p><span className="font-medium text-gray-600">Date :</span> {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                {order.prestataire_email && (
                  <p><span className="font-medium text-gray-600">Prestataire :</span> {order.prestataire_email}</p>
                )}
              </div>

              <p className="text-base font-bold text-gray-900 mt-3">{order.price ? `${order.price}€` : '-'}</p>
            </div>

            {/* Actions — séparées du contenu cliquable */}
            <div className="px-5 pb-5 pt-0 space-y-2 border-t border-gray-100 mt-auto">

              {/* Annulation — commandes en attente */}
              {order.status === 'pending' && (
                <>
                  {cancelError[order.id] && (
                    <p className="text-red-600 text-xs mb-1">{cancelError[order.id]}</p>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleCancelOrder(order.id); }}
                    disabled={cancelling[order.id]}
                    className="w-full mt-3 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium text-sm disabled:opacity-50">
                    {cancelling[order.id] ? 'Annulation...' : 'Annuler la commande'}
                  </button>
                </>
              )}

              {/* Photos + évaluation + facture */}
              {PHOTO_STATUSES.includes(order.status) && (
                <div className="space-y-2 pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchPhotos(order.id); }}
                    disabled={loadingPhotos[order.id]}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-medium text-sm disabled:opacity-50">
                    {loadingPhotos[order.id] ? 'Chargement...' : isExpanded ? 'Masquer les photos' : 'Voir les photos'}
                  </button>

                  {order.status === 'completed' && (
                    <div className="flex gap-2">
                      {!order.has_review ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onReview(order); }}
                          className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition font-medium text-sm">
                          Évaluer
                        </button>
                      ) : (
                        <div className="flex-1 bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-lg text-center font-medium text-sm">
                          Évalué
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); exportFacturePDF(order); }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium text-sm transition">
                        Facture
                      </button>
                    </div>
                  )}

                  {order.status === 'paid' && (
                    <button
                      onClick={e => { e.stopPropagation(); exportFacturePDF(order); }}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium text-sm transition">
                      Télécharger la facture
                    </button>
                  )}
                </div>
              )}

              {/* Photos expandées */}
              {isExpanded && (
                <div className="pt-2">
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {beforePhoto && (
                        <div className="relative">
                          <img src={beforePhoto.url} alt="Avant"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                          <span className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-0.5 rounded text-xs font-medium">
                            Avant
                          </span>
                        </div>
                      )}
                      {afterPhoto && (
                        <div className="relative">
                          <img src={afterPhoto.url} alt="Après"
                            className="w-full h-32 object-cover rounded-lg border border-green-200" />
                          <span className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white px-2 py-0.5 rounded text-xs font-medium">
                            Après
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-lg p-3 text-center text-gray-500 text-sm">
                      Aucune photo disponible
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderListFull;
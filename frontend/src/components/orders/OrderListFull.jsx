// frontend/src/components/orders/OrderListFull.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

//Import pour la création d'une facture en PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../hooks/useAuth';
import logoMemoria from '../../assets/Logos-Mémoria.jpeg';

// Extraits hors du composant — pas de recréation à chaque render
const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Payée', color: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'En cours', color: 'bg-purple-100 text-purple-800' },
  awaiting_validation: { label: 'En attente validation', color: 'bg-orange-100 text-orange-800' },
  correction_requested: { label: 'Correction demander', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Terminée', color: 'bg-green-200 text-green-900' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
  disputed: { label: 'Litige en cours', color: 'bg-red-100 text-red-800' },
};

const PHOTO_STATUSES = ['completed', 'awaiting_validation', 'disputed'];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

/**
 * Liste complète des commandes client avec affichage lazy des photos.
 * Les photos sont chargées à la demande et mises en cache dans orderPhotos.
 *
 * @param {Function} onReview - Callback déclenché au clic sur "Évaluer"
 */
function OrderListFull({ onReview }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderPhotos, setOrderPhotos] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState({});
  const [cancelError, setCancelError] = useState({});
  const [cancelSuccess, setCancelSuccess] = useState({});
  const [cancelling, setCancelling] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Harmonisé sur axios — toute l'app utilise axios, pas fetch natif
      const response = await axios.get('/api/orders', authHeaders());
      setOrders(response.data.data || []);
    } catch {
      setError('Impossible de charger vos commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les photos d'une commande à la demande et les met en cache.
   * Si déjà chargées, toggle simplement l'affichage.
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
      // Échec silencieux — le bouton reste disponible pour réessayer
      setOrderPhotos(prev => ({ ...prev, [orderId]: [] }));
    } finally {
      setLoadingPhotos(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setCancelling(prev => ({ ...prev, [orderId]: true }));
    setCancelError(prev => ({ ...prev, [orderId]: null }));
    try {
      await axios.patch(`/api/orders/${orderId}/cancel-client`, {}, authHeaders());
      setCancelSuccess(prev => ({ ...prev, [orderId]: true }));
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
    const mainColor = [59, 130, 246]; // bleu client
    const today = new Date().toLocaleDateString('fr-FR');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    const logoBase64 = await loadImageAsBase64(logoMemoria);

    // ── Bannière header ──────────────────────────────────────────
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

    // ── Infos client ─────────────────────────────────────────────
    let y = 50;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Client : ${user.prenom} ${user.nom}`, 15, y); y += 7;
    doc.text(`Email : ${user.email}`, 15, y); y += 7;
    doc.text(`Téléphone : ${user.telephone || 'Non renseigné'}`, 15, y); y += 7;
    doc.text(`Date de facture : ${today}`, 15, y); y += 15;

    // ── Message de remerciement ───────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      'Nous vous remercions de votre confiance et de votre commande sur la plateforme Mémoria.',
      15, y, { maxWidth: pageWidth - 30 }
    ); y += 8;
    doc.text(
      'Notre équipe reste disponible pour toute question ou besoin complémentaire.',
      15, y, { maxWidth: pageWidth - 30 }
    ); y += 15;

    // ── Tableau commande ─────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    autoTable(doc, {
      startY: y,
      head: [['Champ', 'Détail']],
      body: [
        ['Numéro de commande', order.id],
        ['Date de commande', formatDate(order.created_at)],
        ['Service', order.service_name || '-'],
        ['Cimetière', order.cemetery_name || '-'],
        ['Lieu', order.cemetery_city || '-'],
        ['Statut', order.status === 'completed' ? 'Terminée' : 'Payée'],
        ['Montant réglé', order.price ? `${order.price} €` : '-'],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: mainColor, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { fontStyle: 'bold' } }
    });

    // ── Pied de page ─────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Mémoria © ${new Date().getFullYear()} — Page ${i}/${pageCount}`,
        pageWidth / 2, 290, { align: 'center' }
      );
    }

    doc.save(`memoria-facture-${order.id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const photos = orderPhotos[order.id] || [];
        const beforePhoto = photos.find(p => p.type === 'before');
        const afterPhoto = photos.find(p => p.type === 'after');
        const isExpanded = expandedOrderId === order.id;
        const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };

        return (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">

            {/* Zone cliquable — navigation vers détail */}
            <div className="cursor-pointer p-6" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.service_name || 'Service non défini'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div><span className="font-medium">📍 Cimetière :</span> {order.cemetery_name || 'Non spécifié'}</div>
                    <div><span className="font-medium">📅 Date :</span> {new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                    <div><span className="font-medium">💰 Prix :</span> {order.price ? `${order.price}€` : 'Non défini'}</div>
                    {order.prestataire_email && (
                      <div><span className="font-medium">👤 Prestataire :</span> {order.prestataire_email}</div>
                    )}
                  </div>
                </div>

                <svg className="w-6 h-6 text-gray-400 ml-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Bouton annulation — commandes en attente uniquement */}
            {order.status === 'pending' && (
              <div className="px-6 pb-4 border-t border-gray-200 mt-2">
                {cancelError[order.id] && (
                  <p className="text-red-600 text-sm mb-2">{cancelError[order.id]}</p>
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleCancelOrder(order.id); }}
                  disabled={cancelling[order.id]}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 mt-3"
                >
                  {cancelling[order.id] ? '⏳ Annulation...' : '❌ Annuler la commande'}
                </button>
              </div>
            )}

            {/* Actions photos + évaluation */}
            {PHOTO_STATUSES.includes(order.status) && (
              <div className="px-6 pb-4 border-t border-gray-200">
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchPhotos(order.id); }}
                    disabled={loadingPhotos[order.id]}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                  >
                    {loadingPhotos[order.id] ? '⏳ Chargement...' : isExpanded ? '🔼 Masquer photos' : '📷 Voir les photos'}
                  </button>

                  {order.status === 'completed' && (
                    !order.has_review ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReview(order); }}
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
                  {/* Bouton facture — commandes payées et terminées */}
                  {['paid', 'completed'].includes(order.status) && (
                    <div className="px-6 pb-4 border-t border-gray-200">
                      <button
                        onClick={e => { e.stopPropagation(); exportFacturePDF(order); }}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        📄 Télécharger la facture
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photos expandées */}
            {isExpanded && (
              <div className="px-6 pb-6">
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {beforePhoto && (
                      <div className="relative">
                        <img src={beforePhoto.url} alt="Avant intervention"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200" />
                        <span className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
                          📷 Avant
                        </span>
                      </div>
                    )}
                    {afterPhoto && (
                      <div className="relative">
                        <img src={afterPhoto.url} alt="Après intervention"
                          className="w-full h-64 object-cover rounded-lg border-2 border-green-200" />
                        <span className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded text-sm font-medium">
                          ✨ Après
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600 mt-4">
                    Aucune photo disponible pour cette intervention
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default OrderListFull;
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // States pour les données
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [disputedOrders, setDisputedOrders] = useState([]);
  const [orderPhotos, setOrderPhotos] = useState({});

  // States pour les modals
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDisputes, setLoadingDisputes] = useState(true);

  // Charger toutes les données au montage
  useEffect(() => {
    fetchStats();
    fetchPendingProviders();
    fetchPendingOrders();
    fetchDisputedOrders();
  }, []);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/providers/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingProviders(response.data.data);
    } catch (err) {
      console.error('Erreur prestataires:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/pending-validation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOrders(response.data.data);
      
      // Charger les photos
      response.data.data.forEach(order => fetchOrderPhotos(order.id));
    } catch (err) {
      console.error('Erreur interventions:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchDisputedOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/disputed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisputedOrders(response.data.data);
      
      // Charger les photos
      response.data.data.forEach(order => fetchOrderPhotos(order.id));
    } catch (err) {
      console.error('Erreur litiges:', err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const fetchOrderPhotos = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/photos/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderPhotos(prev => ({ ...prev, [orderId]: response.data.data }));
    } catch (err) {
      console.error('Erreur photos:', err);
    }
  };

  // ============================================
  // ACTIONS HANDLERS
  // ============================================

  const handleApproveProvider = async (providerId) => {
    if (!window.confirm('Valider ce prestataire ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/providers/${providerId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Prestataire validé !');
      fetchPendingProviders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleRejectProvider = async (providerId) => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      alert('Le motif doit contenir au moins 10 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/providers/${providerId}/reject`, 
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Prestataire rejeté');
      setShowRejectModal(null);
      setRejectReason('');
      fetchPendingProviders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleValidateOrder = async (orderId) => {
    if (!window.confirm('Valider cette intervention ? Le paiement sera débloqué.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${orderId}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Intervention validée !');
      fetchPendingOrders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleMarkAsDisputed = async (orderId) => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      alert('Le motif doit contenir au moins 10 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${orderId}/dispute`,
        { reason: disputeReason },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Commande marquée comme litigieuse');
      setShowDisputeModal(null);
      setDisputeReason('');
      fetchPendingOrders();
      fetchDisputedOrders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleResolveDispute = async (orderId, action) => {
    const messages = {
      validate: 'Valider malgré le litige ?',
      refund: 'Rembourser le client ?',
      request_correction: 'Demander une correction ?'
    };

    if (!window.confirm(messages[action])) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${orderId}/resolve`,
        { action },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Litige résolu !');
      fetchDisputedOrders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const togglePhotos = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  // ============================================
  // SECTIONS CONTENT
  // ============================================

  const sections = {
    overview: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Statistiques de la plateforme</h2>

        {loadingStats ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Utilisateurs</h3>
                <p className="text-4xl font-bold mb-2">{stats.users.total}</p>
                <div className="text-sm opacity-90">
                  <p>Clients: {stats.users.by_role.client || 0}</p>
                  <p>Prestataires: {stats.users.by_role.prestataire || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Commandes</h3>
                <p className="text-4xl font-bold mb-2">{stats.orders.total}</p>
                <div className="text-sm opacity-90">
                  <p>Complétées: {stats.orders.by_status.completed || 0}</p>
                  <p>En cours: {stats.orders.by_status.accepted || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">CA Total</h3>
                <p className="text-4xl font-bold mb-2">{stats.revenue.total.toFixed(2)}€</p>
                <div className="text-sm opacity-90">
                  <p>{stats.revenue.paid_orders} commandes payées</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Prestataires Actifs</h3>
                <p className="text-4xl font-bold mb-2">{stats.users.by_role.prestataire || 0}</p>
              </div>
            </div>

            {/* Répartition statuts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Répartition des commandes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.orders.by_status).map(([status, count]) => (
                  <div key={status} className="border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1 capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top prestataires */}
            {stats.top_providers?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🏆 Top 5 Prestataires</h3>
                <div className="space-y-3">
                  {stats.top_providers.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                        <div>
                          <p className="font-semibold">{provider.name}</p>
                          <p className="text-sm text-gray-500">{provider.missions_completed} missions</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-green-600">{provider.total_earned.toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-12">Impossible de charger les statistiques</p>
        )}
      </div>
    ),

    disputes: (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Litiges en cours</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {disputedOrders.length} litige{disputedOrders.length > 1 ? 's' : ''}
          </span>
        </div>

        {loadingDisputes ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : disputedOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucun litige en cours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputedOrders.map(order => {
              const photos = orderPhotos[order.id] || [];
              const beforePhoto = photos.find(p => p.type === 'before');
              const afterPhoto = photos.find(p => p.type === 'after');

              return (
                <div key={order.id} className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">{order.cemetery_name}</h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">🚨 Litige</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{order.client_prenom} {order.client_nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prestataire</p>
                      <p className="font-medium">{order.prestataire_prenom} {order.prestataire_nom}</p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-white rounded border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-1">Motif :</p>
                    <p className="text-sm">{order.dispute_reason}</p>
                  </div>

                  {(beforePhoto || afterPhoto) && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {beforePhoto && (
                        <div>
                          <p className="text-sm font-medium mb-2">📸 Avant</p>
                          <img src={beforePhoto.url} alt="Avant" className="w-full h-48 object-cover rounded-lg" />
                        </div>
                      )}
                      {afterPhoto && (
                        <div>
                          <p className="text-sm font-medium mb-2">✨ Après</p>
                          <img src={afterPhoto.url} alt="Après" className="w-full h-48 object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleResolveDispute(order.id, 'validate')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                      ✓ Valider
                    </button>
                    <button onClick={() => handleResolveDispute(order.id, 'request_correction')} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                      🔄 Correction
                    </button>
                    <button onClick={() => handleResolveDispute(order.id, 'refund')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                      💸 Rembourser
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    interventions: (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Interventions à valider</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {pendingOrders.length} en attente
          </span>
        </div>

        {loadingOrders ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune intervention en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(order => {
              const photos = orderPhotos[order.id] || [];
              const beforePhoto = photos.find(p => p.type === 'before');
              const afterPhoto = photos.find(p => p.type === 'after');

              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">{order.cemetery_name}</h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">En attente validation</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{order.client_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prestataire</p>
                      <p className="font-medium">{order.prestataire_prenom} {order.prestataire_nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{order.service_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="font-medium">{order.price}€</p>
                    </div>
                  </div>

                  <button onClick={() => togglePhotos(order.id)} className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {selectedOrder === order.id ? '▼ Masquer les photos' : '▶ Voir les photos'}
                  </button>

                  {selectedOrder === order.id && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      {beforePhoto ? (
                        <div>
                          <p className="text-sm font-medium mb-2">📸 Avant</p>
                          <img src={beforePhoto.url} alt="Avant" className="w-full h-64 object-cover rounded-lg" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                          <p className="text-gray-500">Photo avant manquante</p>
                        </div>
                      )}
                      {afterPhoto ? (
                        <div>
                          <p className="text-sm font-medium mb-2">✨ Après</p>
                          <img src={afterPhoto.url} alt="Après" className="w-full h-64 object-cover rounded-lg" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                          <p className="text-gray-500">Photo après manquante</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleValidateOrder(order.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
                      ✓ Valider ({(parseFloat(order.price) * 0.80).toFixed(2)}€ → prestataire)
                    </button>
                    <button onClick={() => setShowDisputeModal(order.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition">
                      🚨 Marquer comme litigieux
                    </button>
                  </div>

                  {/* Modal dispute */}
                  {showDisputeModal === order.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Marquer comme litigieux</h3>
                        <p className="text-sm text-gray-600 mb-4">Motif du litige (min 10 caractères)</p>
                        <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 mb-4" rows="4" placeholder="Ex: Photos floues, travail incomplet..." />
                        <div className="flex gap-3">
                          <button onClick={() => { setShowDisputeModal(null); setDisputeReason(''); }} className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Annuler</button>
                          <button onClick={() => handleMarkAsDisputed(order.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Confirmer</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    providers: (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Prestataires à valider</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            {pendingProviders.length} en attente
          </span>
        </div>

        {loadingProviders ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingProviders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucun prestataire en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProviders.map(provider => (
              <div key={provider.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{provider.prenom} {provider.nom}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{provider.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{provider.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SIRET</p>
                    <p className="font-medium">{provider.siret || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="font-medium">{provider.zone_intervention || 'Non définie'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleApproveProvider(provider.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    ✓ Valider
                  </button>
                  <button onClick={() => setShowRejectModal(provider.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    ✗ Rejeter
                  </button>
                </div>

                {/* Modal reject */}
                {showRejectModal === provider.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-lg font-semibold mb-4">Rejeter le prestataire</h3>
                      <p className="text-sm text-gray-600 mb-4">Motif du rejet (min 10 caractères)</p>
                      <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 mb-4" rows="4" placeholder="Ex: Documents incomplets, SIRET invalide..." />
                      <div className="flex gap-3">
                        <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Annuler</button>
                        <button onClick={() => handleRejectProvider(provider.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Confirmer</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

{/* NAVBAR */}
<nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
            <span className="text-2xl font-serif font-bold">M</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
      </div>

      {/* Liens navigation */}
      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => navigate('/')} className="text-gray-900 hover:text-blue-600 font-medium transition">Accueil</button>
        <button onClick={() => navigate('/', { state: { scrollTo: 'comment-ca-marche-section' } })} className="text-gray-700 hover:text-blue-600 transition">Services</button>
        <button onClick={() => navigate('/', { state: { scrollTo: 'faq-section' } })} className="text-gray-700 hover:text-blue-600 transition">À propos</button>
        <button onClick={() => navigate('/', { state: { scrollTo: 'team-section' } })} className="text-gray-700 hover:text-blue-600 transition">Contact</button>
      </div>

      {/* Déconnexion */}
      <div className="flex items-center gap-4">
        <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-1 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition">Déconnexion</button>
      </div>
    </div>
  </div>
</nav>

      {/* DASHBOARD */}
      <main className="flex-1 flex bg-purple-50 gap-6 px-6 py-8 pt-32 w-full">

        {/* Sidebar */}
        <aside className="w-1/3 bg-white border-l-4 border-purple-600 rounded-lg p-6 space-y-4 shadow h-fit">
          <p className="text-gray-500 uppercase font-semibold text-sm mb-4">Sections</p>
          <button onClick={() => setActiveSection('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'overview' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Aperçu
          </button>
          <button onClick={() => setActiveSection('disputes')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'disputes' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Litiges ({disputedOrders.length})
          </button>
          <button onClick={() => setActiveSection('interventions')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'interventions' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Interventions ({pendingOrders.length})
          </button>
          <button onClick={() => setActiveSection('providers')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'providers' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Prestataires ({pendingProviders.length})
          </button>
        </aside>

        {/* Contenu */}
        <section className="flex-1 bg-white border-r-4 border-purple-600 rounded-lg p-6 shadow">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Dashboard Administrateur</h1>
            {user && (
              <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>
            )}
          </div>

          {/* Contenu dynamique */}
          {sections[activeSection]}
        </section>

      </main>

    </div>
  );
}

export default DashboardAdmin;
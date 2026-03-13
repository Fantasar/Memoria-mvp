// frontend/src/pages/dashboards/DashboardAdmin.jsx
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';



const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const STATUS_CONFIG = {
  pending: { label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '💳 Payée', color: 'bg-blue-100 text-blue-800' },
  accepted: { label: '🔄 Acceptée', color: 'bg-green-100 text-green-800' },
  in_progress: { label: '🔄 En cours', color: 'bg-purple-100 text-purple-800' },
  correction_requested: { label: 'En correcion', color: 'bg-purple-100 text-orange-800' },
  awaiting_validation: { label: '⏰ À valider', color: 'bg-orange-100 text-orange-800' },
  completed: { label: '✅ Terminée', color: 'bg-green-200 text-green-900' },
  disputed: { label: '🚨 Litige', color: 'bg-red-100 text-red-800' },
  cancelled: { label: '❌ Annulée', color: 'bg-gray-100 text-gray-800' },
  refunded: { label: '💸 Remboursée', color: 'bg-indigo-100 text-indigo-800' },
};

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  accepted: 'Acceptée',
  in_progress: 'En cours',
  correction_requested: 'En attente de Correction',
  awaiting_validation: 'En attente validation',
  completed: 'Terminée',
  cancelled: 'Annulée',
  disputed: 'Litige',
  refunded: 'Remboursée',
};

function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Données
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [disputedOrders, setDisputedOrders] = useState([]);
  const [orderPhotos, setOrderPhotos] = useState({});
  const [allOrders, setAllOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [finances, setFinances] = useState(null);
  const [cemeteries, setCemeteries] = useState([]);
  const [services, setServices] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);

  // Loadings
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [loadingAllOrders, setLoadingAllOrders] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFinances, setLoadingFinances] = useState(true);
  const [loadingCemeteries, setLoadingCemeteries] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // UI states
  const [historyFilter, setHistoryFilter] = useState('all');
  const [photoFilter, setPhotoFilter] = useState('all');
  const [usersTab, setUsersTab] = useState('clients');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchCemeteries, setSearchCemeteries] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCemetery, setSelectedCemetery] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Modals prestataires
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(null);

  // Modals litiges
  const [showDisputeModal, setShowDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeError, setDisputeError] = useState(null);

  // Ajout cimetière
  const [showAddCemetery, setShowAddCemetery] = useState(false);
  const [newCemetery, setNewCemetery] = useState({ name: '', city: '', postal_code: '', department: '', address: '' });
  const [addingCemetery, setAddingCemetery] = useState(false);
  const [cemeteryError, setCemeteryError] = useState(null);

  // Ajout service
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '' });
  const [addingService, setAddingService] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  // Validation interventions
  const [validateError, setValidateError] = useState({});
  const [resolveError, setResolveError] = useState({});

  // Approve provider
  const [approveError, setApproveError] = useState({});

  // Planning prestataire
  const [selectedProviderCalendar, setSelectedProviderCalendar] = useState(null);
  const [selectedProviderInfo, setSelectedProviderInfo] = useState(null);
  const [providerCalendarData, setProviderCalendarData] = useState([]);
  const [loadingProviderCalendar, setLoadingProviderCalendar] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);

  // Annuaire des utilisateurs et prestataire de la plateforme
  const [blockError, setBlockError] = useState({});
  const [deleteError, setDeleteError] = useState({});

  // Gallerie photos
  const [searchPhotos, setSearchPhotos] = useState('');


  // Commandes client
  const [selectedClientOrders, setSelectedClientOrders] = useState(null);
  const [clientOrdersData, setClientOrdersData] = useState([]);
  const [loadingClientOrders, setLoadingClientOrders] = useState(false);
  const [disputesTab, setDisputesTab] = useState('disputes');

  // Modal pour Message avec Crips
  const [crispMessages, setCrispMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Modal pour intégrer les notification de Email dans Messages
  const [contactNotifications, setContactNotifications] = useState([]);
  const [loadingContactNotifs, setLoadingContactNotifs] = useState(false);
  const [unreadContactNotifs, setUnreadContactNotifs] = useState(0);

  // Modal pour récupèrer les documents du prestataire
  const [providerDocuments, setProviderDocuments] = useState({});
  const [loadingProviderDocs, setLoadingProviderDocs] = useState({});
  const [expandedProviderDocs, setExpandedProviderDocs] = useState({});
  const [allProviderDocs, setAllProviderDocs] = useState([]);
  const [loadingAllDocs, setLoadingAllDocs] = useState(false);
  const [searchDocs, setSearchDocs] = useState('');
  const [filterDocType, setFilterDocType] = useState('all');
  const [unreadDocs, setUnreadDocs] = useState(0);


  const NAV_SECTIONS = [
    { key: 'overview', label: ` Aperçu` },
    { key: 'messages', label: ` Messages${(unreadMessages + unreadContactNotifs) > 0 ? ` (${unreadMessages + unreadContactNotifs})` : ''}` },
    { key: 'disputes', label: ` Litiges` },
    { key: 'interventions', label: ` Interventions` },
    { key: 'providers', label: ` Prestataires` },
    { key: 'users', label: ` Utilisateurs` },
    { key: 'gallery', label: ` Galerie photos` },
    { key: 'finances', label: ` Finances` },
    { key: 'cemeteries', label: ` Cimetières` },
    { key: 'services', label: ` Services` },
    { key: 'documents', label: ` Documents${unreadDocs > 0 ? ` (${unreadDocs})` : ''}` },
    { key: 'history', label: ` Historique` },
  ];

  useEffect(() => {
    fetchStats();
    fetchPendingProviders();
    fetchPendingOrders();
    fetchDisputedOrders();
    fetchAllOrders();
    fetchAllPhotos();
    fetchAllUsers();
    fetchFinances();
    fetchCemeteries();
    fetchServices();
    fetchAllProviderDocs();
    fetchProviderDocuments();
    fetchContactNotifications();
  }, []);

  useEffect(() => {
    fetchCrispMessages();
    const interval = setInterval(fetchCrispMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUnreadDocs();
    const interval = setInterval(fetchUnreadDocs, 10000);
    return () => clearInterval(interval);
  }, []);

  // ─── Fetch functions ───────────────────────────────────────────────────────

  /** Récupère les statistiques globales de la plateforme */
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats', authHeaders());
      setStats(res.data.data);
    } catch { /* silencieux */ } finally { setLoadingStats(false); }
  };

  /** Récupère les prestataires en attente de validation */
  const fetchPendingProviders = async () => {
    try {
      const res = await axios.get('/api/providers/pending', authHeaders());
      setPendingProviders(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingProviders(false); }
  };

  /** Récupère les commandes en attente de validation admin et leurs photos */
  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get('/api/orders/pending-validation', authHeaders());
      const orders = res.data.data || [];
      setPendingOrders(orders);
      orders.forEach(o => fetchOrderPhotos(o.id));
    } catch { /* silencieux */ } finally { setLoadingOrders(false); }
  };

  /** Récupère les commandes en litige et leurs photos associées */
  const fetchDisputedOrders = async () => {
    try {
      const res = await axios.get('/api/orders/disputed', authHeaders());
      const orders = res.data.data || [];
      setDisputedOrders(orders);
      orders.forEach(o => fetchOrderPhotos(o.id));
    } catch { /* silencieux */ } finally { setLoadingDisputes(false); }
  };

  /** Récupère les photos d'une commande spécifique */
  const fetchOrderPhotos = async (orderId) => {
    try {
      const res = await axios.get(`/api/photos/order/${orderId}`, authHeaders());
      setOrderPhotos(prev => ({ ...prev, [orderId]: res.data.data || [] }));
    } catch { /* silencieux */ }
  };

  /** Récupère toutes les commandes de la plateforme */
  const fetchAllOrders = async () => {
    try {
      const res = await axios.get('/api/orders', authHeaders());
      setAllOrders(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingAllOrders(false); }
  };

  /** Récupère tous les utilisateurs et les sépare en clients et prestataires */
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', authHeaders());
      const all = res.data.data || [];
      setClients(all.filter(u => u.role === 'client'));
      setProviders(all.filter(u => u.role === 'prestataire'));
    } catch { /* silencieux */ } finally { setLoadingUsers(false); }
  };

  /** Récupère tous les documents prestataires et les marque automatiquement comme lus */
  const fetchAllProviderDocs = async () => {
    setLoadingAllDocs(true);
    try {
      const res = await axios.get('/api/documents/admin', authHeaders());
      setAllProviderDocs(res.data.data || []);
      await axios.patch('/api/documents/admin/all', {}, authHeaders());
      setUnreadDocs(0);
    } catch {
      // Échec silencieux
    } finally {
      setLoadingAllDocs(false);
    }
  };

  /** Récupère les données financières via les statistiques */
  const fetchFinances = async () => {
    try {
      const res = await axios.get('/api/stats', authHeaders());
      setFinances(res.data.data);
    } catch { /* silencieux */ } finally { setLoadingFinances(false); }
  };

  /** Récupère la liste des cimetières */
  const fetchCemeteries = async () => {
    try {
      const res = await axios.get('/api/cemeteries', authHeaders());
      setCemeteries(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingCemeteries(false); }
  };

  /** Récupère la liste des services disponibles */
  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/service-categories/admin', authHeaders());
      setServices(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingServices(false); }
  };

  /** Récupère toutes les photos de missions */
  const fetchAllPhotos = async () => {
    try {
      const res = await axios.get('/api/photos', authHeaders());
      setAllPhotos(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingPhotos(false); }
  };

  /** Récupère le planning d'un prestataire spécifique */
  const fetchProviderCalendar = async (providerId) => {
    setLoadingProviderCalendar(true);
    try {
      const res = await axios.get(`/api/orders/calendar/${providerId}`, authHeaders());
      setProviderCalendarData(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingProviderCalendar(false); }
  };

  /** Récupère les messages Crisp — appelé toutes les 10 secondes via setInterval */
  const fetchCrispMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await axios.get('/api/admin/messages', authHeaders());
      setCrispMessages(res.data.data.messages || []);
      setUnreadMessages(res.data.data.unread || 0);
    } catch {
      // Échec silencieux
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
  * Récupère les documents d'un prestataire spécifique
  * Toggle l'affichage si les documents sont déjà chargés
  */
  const fetchProviderDocuments = async (providerId) => {
    // Toggle — si déjà chargé, juste afficher/masquer
    if (providerDocuments[providerId] !== undefined) {
      setExpandedProviderDocs(prev => ({ ...prev, [providerId]: !prev[providerId] }));
      return;
    }
    setLoadingProviderDocs(prev => ({ ...prev, [providerId]: true }));
    try {
      const res = await axios.get('/api/documents/admin', authHeaders());
      // Filtre les documents de ce prestataire uniquement
      const docs = (res.data.data || []).filter(d => d.user_id === providerId);
      setProviderDocuments(prev => ({ ...prev, [providerId]: docs }));
      setExpandedProviderDocs(prev => ({ ...prev, [providerId]: true }));
    } catch {
      setProviderDocuments(prev => ({ ...prev, [providerId]: [] }));
    } finally {
      setLoadingProviderDocs(prev => ({ ...prev, [providerId]: false }));
    }
  };

  /** Récupère le nombre de documents non lus — appelé toutes les 10 secondes via setInterval */
  const fetchUnreadDocs = async () => {
    try {
      const res = await axios.get('/api/documents/admin/unread', authHeaders());
      setUnreadDocs(res.data.data?.count || 0);
    } catch {
      // Échec silencieux
    }
  };

  /** Récupère les notifications de type contact_message et calcule le compteur non lus */
  const fetchContactNotifications = async () => {
    setLoadingContactNotifs(true);
    try {
      const res = await axios.get('/api/notifications', authHeaders());
      const notifs = res.data.data?.notifications || [];
      const contactNotifs = notifs.filter(n => n.type === 'contact_message');
      setContactNotifications(contactNotifs);
      setUnreadContactNotifs(contactNotifs.filter(n => !n.is_read).length);
    } catch {
      // Échec silencieux
    } finally {
      setLoadingContactNotifs(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /** Valide un prestataire après confirmation */
  const handleApproveProvider = async (providerId) => {
    if (!window.confirm('Valider ce prestataire ?')) return;
    try {
      await axios.patch(`/api/providers/${providerId}/approve`, {}, authHeaders());
      fetchPendingProviders();
    } catch (err) {
      setApproveError(prev => ({ ...prev, [providerId]: err.response?.data?.error?.message || 'Erreur' }));
    }
  };

  /** Rejette un prestataire avec un motif — minimum 10 caractères requis */
  const handleRejectProvider = async (providerId) => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      setRejectError('Le motif doit contenir au moins 10 caractères');
      return;
    }
    try {
      await axios.patch(`/api/providers/${providerId}/reject`,
        { reason: rejectReason },
        authHeaders()
      );
      setShowRejectModal(null);
      setRejectReason('');
      setRejectError(null);
      fetchPendingProviders();
    } catch (err) {
      setRejectError(err.response?.data?.error?.message || 'Erreur');
    }
  };

  /** Valide une intervention et débloque le paiement au prestataire */
  const handleValidateOrder = async (orderId) => {
    if (!window.confirm('Valider cette intervention ? Le paiement sera débloqué.')) return;
    try {
      await axios.patch(`/api/orders/${orderId}/validate`, {}, authHeaders());
      fetchPendingOrders();
      fetchStats();
    } catch (err) {
      setValidateError(prev => ({ ...prev, [orderId]: err.response?.data?.error?.message || 'Erreur' }));
    }
  };

  /** Ouvre un litige sur une commande en attente de validation */
  const handleMarkAsDisputed = async (orderId) => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      setDisputeError('Le motif doit contenir au moins 10 caractères');
      return;
    }
    try {
      await axios.patch(`/api/orders/${orderId}/dispute`,
        { reason: disputeReason },
        authHeaders()
      );
      setShowDisputeModal(null);
      setDisputeReason('');
      setDisputeError(null);
      fetchPendingOrders();
      fetchDisputedOrders();
    } catch (err) {
      setDisputeError(err.response?.data?.error?.message || 'Erreur');
    }
  };

  /**
  * Résout un litige selon l'action choisie par l'admin
  * @param {string} action - 'validate' | 'refund' | 'request_correction'
  */
  const handleResolveDispute = async (orderId, action) => {
    const messages = {
      validate: 'Valider malgré le litige ?',
      refund: 'Rembourser le client ?',
      request_correction: 'Demander une correction ?'
    };
    if (!window.confirm(messages[action])) return;
    try {
      await axios.patch(`/api/orders/${orderId}/resolve`, { action }, authHeaders());
      fetchDisputedOrders();
      fetchAllOrders();
    } catch (err) {
      setResolveError(prev => ({ ...prev, [orderId]: err.response?.data?.error?.message || 'Erreur' }));
    }
  };

  /** Ajoute un nouveau cimetière — gère le cas de doublon */
  const handleAddCemetery = async (e) => {
    e.preventDefault();
    setCemeteryError(null);
    setAddingCemetery(true);
    try {
      await axios.post('/api/cemeteries', newCemetery, authHeaders());
      setShowAddCemetery(false);
      setNewCemetery({ name: '', city: '', postal_code: '', department: '', address: '' });
      fetchCemeteries();
    } catch (err) {
      const code = err.response?.data?.error?.code;
      setCemeteryError(
        code === 'DUPLICATE_CEMETERY'
          ? 'Ce cimetière existe déjà dans cette ville'
          : err.response?.data?.error?.message || "Erreur lors de l'ajout"
      );
    } finally {
      setAddingCemetery(false);
    }
  };

  /** Ajoute un nouveau service — gère le cas de doublon */
  const handleAddService = async (e) => {
    e.preventDefault();
    setServiceError(null);
    setAddingService(true);
    try {
      await axios.post('/api/service-categories', newService, authHeaders());
      setShowAddService(false);
      setNewService({ name: '', description: '', base_price: '' });
      fetchServices();
    } catch (err) {
      const code = err.response?.data?.error?.code;
      setServiceError(
        code === '23505'
          ? 'Ce service existe déjà'
          : err.response?.data?.error?.message || "Erreur lors de l'ajout"
      );
    } finally {
      setAddingService(false);
    }
  };

  /** Ferme le panneau calendrier prestataire et réinitialise les états associés */
  const closeProviderCalendar = () => {
    setSelectedProviderCalendar(null);
    setSelectedProviderInfo(null);
    setProviderCalendarData([]);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const Spinner = ({ color = 'purple' }) => (
    <div className="flex justify-center py-12">
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${color}-600`} />
    </div>
  );

  const filteredOrders = historyFilter === 'all' ? allOrders : allOrders.filter(o => o.status === historyFilter);
  const filteredPhotos = photoFilter === 'all' ? allPhotos : allPhotos.filter(p => (p.photo_type || p.type) === photoFilter);
  const filteredClients = clients.filter(c => `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(searchUsers.toLowerCase()));
  const filteredProviders = providers.filter(p => `${p.prenom} ${p.nom} ${p.email} ${p.siret || ''} ${p.zone_intervention || ''}`.toLowerCase().includes(searchUsers.toLowerCase()));
  const filteredCemeteries = cemeteries.filter(c => `${c.name} ${c.city} ${c.department || ''}`.toLowerCase().includes(searchCemeteries.toLowerCase()));

  // ─── Rendu des sections ────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {

      case 'overview': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Statistiques de la plateforme</h2>
          {loadingStats ? <Spinner /> : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Utilisateurs', value: stats.users.total, sub: `Clients: ${stats.users.by_role.client || 0} · Prestataires: ${stats.users.by_role.prestataire || 0}`, from: 'from-blue-500', to: 'to-blue-600' },
                  { label: 'Commandes', value: stats.orders.total, sub: `Complétées: ${stats.orders.by_status.completed || 0} · En cours: ${stats.orders.by_status.accepted || 0} · Annulées: ${stats.orders.by_status.cancelled || 0}`, from: 'from-green-500', to: 'to-green-600' },
                  { label: 'CA Total', value: `${stats.revenue.total.toFixed(2)}€`, sub: `${stats.revenue.paid_orders} commandes payées`, from: 'from-purple-500', to: 'to-purple-600' },
                  { label: 'Prestataires Actifs', value: stats.users.by_role.prestataire || 0, sub: '', from: 'from-orange-500', to: 'to-orange-600' },
                ].map(kpi => (
                  <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-lg shadow-lg p-6 text-white`}>
                    <h3 className="text-sm font-medium opacity-90 mb-2">{kpi.label}</h3>
                    <p className="text-4xl font-bold mb-2">{kpi.value}</p>
                    {kpi.sub && <p className="text-sm opacity-90">{kpi.sub}</p>}
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Répartition des commandes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.orders.by_status).map(([status, count]) => (
                    <div key={status} className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">{STATUS_LABELS[status] || status}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {stats.top_providers?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🏆 Top 5 Prestataires</h3>
                  <div className="space-y-3">
                    {stats.top_providers.map((provider, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
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
      );

      case 'messages':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Messages</h2>
              <div className="flex gap-3">
                {unreadMessages > 0 && (
                  <button
                    onClick={async () => {
                      await axios.patch('/api/admin/messages', {}, authHeaders());
                      fetchCrispMessages();
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                    ✅ Tout marquer comme lu ({unreadMessages})
                  </button>
                )}
                {crispMessages.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Supprimer tous les messages ?')) return;
                      await axios.delete('/api/admin/messages', authHeaders());
                      fetchCrispMessages();
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium">
                    🗑️ Tout supprimer
                  </button>
                )}
                <a href="https://app.crisp.chat" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2">
                  💬 Ouvrir Crisp
                </a>
              </div>
            </div>

            {/* ── Messages Crisp ─────────────────────────────────── */}
            <h3 className="text-lg font-semibold mb-3 text-purple-700">💬 Messages Chat</h3>
            {loadingMessages ? (
              <p className="text-gray-500 mb-6">Chargement...</p>
            ) : crispMessages.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center mb-6">
                <p className="text-gray-500">Aucun message chat pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {crispMessages.map(msg => (
                  <div key={msg.id}
                    className={`bg-white border rounded-lg p-4 flex items-start justify-between gap-4 ${!msg.is_read ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                      }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 bg-purple-600 rounded-full inline-block" />}
                        <p className="font-semibold text-gray-900">{msg.from_name || 'Visiteur'}</p>
                        {msg.from_email && <p className="text-sm text-gray-500">{msg.from_email}</p>}
                      </div>
                      <p className="text-gray-700">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.received_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!msg.is_read && (
                        <button
                          onClick={async () => {
                            await axios.patch(`/api/admin/messages/${msg.id}`, {}, authHeaders());
                            fetchCrispMessages();
                          }}
                          className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg">
                          Marquer lu
                        </button>
                      )}
                      <a href="https://app.crisp.chat" target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center">
                        Répondre
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Formulaire de contact ───────────────────────── */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-700">📩 Messages formulaire contact</h3>
              <div className="flex gap-3">
                {contactNotifications.some(n => !n.is_read) && (
                  <button
                    onClick={async () => {
                      await axios.patch('/api/notifications/read-all', {}, authHeaders());
                      fetchContactNotifications();
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm">
                    ✅ Tout marquer comme lu
                  </button>
                )}
                {contactNotifications.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Supprimer tous les messages de contact ?')) return;
                      await Promise.all(
                        contactNotifications.map(n =>
                          axios.delete(`/api/notifications/${n.id}`, authHeaders())
                        )
                      );
                      fetchContactNotifications();
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm">
                    🗑️ Tout supprimer
                  </button>
                )}
              </div>
            </div>

            {loadingContactNotifs ? (
              <p className="text-gray-500">Chargement...</p>
            ) : contactNotifications.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">Aucun message de contact pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contactNotifications.map(notif => (
                  <div key={notif.id}
                    className={`bg-white border rounded-lg p-4 flex items-start justify-between gap-4 ${!notif.is_read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full inline-block" />}
                        <p className="font-semibold text-gray-900">{notif.title}</p>
                      </div>
                      <p className="text-gray-700 text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={async () => {
                            await axios.patch(`/api/notifications/${notif.id}/read`, {}, authHeaders());
                            fetchContactNotifications();
                          }}
                          className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg">
                          Marquer lu
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (!window.confirm('Supprimer ce message ?')) return;
                          await axios.delete(`/api/notifications/${notif.id}`, authHeaders());
                          fetchContactNotifications();
                        }}
                        className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'history': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Historique de la plateforme</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{allOrders.length} commandes</span>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            {['all', 'pending', 'paid', 'accepted', 'awaiting_validation', 'completed', 'disputed', 'cancelled', 'refunded'].map(s => (
              <button key={s} onClick={() => setHistoryFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${historyFilter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s === 'all' ? 'Toutes' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          {loadingAllOrders ? <Spinner /> : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">Aucune commande trouvée</p></div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{order.cemetery_name || 'Cimetière'}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-gray-500">Client</p><p className="font-medium">{order.client_email || '-'}</p></div>
                    <div><p className="text-gray-500">Prestataire</p><p className="font-medium">{order.prestataire_email || 'Non assigné'}</p></div>
                    <div><p className="text-gray-500">Service</p><p className="font-medium">{order.service_name || '-'}</p></div>
                    <div><p className="text-gray-500">Montant</p><p className="font-medium text-green-600">{order.price ? `${parseFloat(order.price).toFixed(2)}€` : '-'}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'gallery': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Galerie photos</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{allPhotos.length} photos</span>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchPhotos} onChange={e => setSearchPhotos(e.target.value)}
              placeholder="Rechercher par n° commande, client, prestataire, cimetière..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {searchPhotos && (
              <button onClick={() => setSearchPhotos('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>

          {/* Filtres type */}
          <div className="flex gap-3 mb-6">
            {[['all', '🖼️ Toutes'], ['before', '📸 Avant'], ['after', '✨ Après']].map(([type, label]) => (
              <button key={type} onClick={() => setPhotoFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${photoFilter === type ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>

          {loadingPhotos ? <Spinner /> : (() => {
            const displayed = filteredPhotos.filter(photo => {
              if (!searchPhotos) return true;
              const q = searchPhotos.toLowerCase();
              return (
                photo.order_id?.toString().includes(q) ||
                photo.cemetery_name?.toLowerCase().includes(q) ||
                photo.cemetery_city?.toLowerCase().includes(q) ||
                photo.client_prenom?.toLowerCase().includes(q) ||
                photo.client_nom?.toLowerCase().includes(q) ||
                photo.prestataire_prenom?.toLowerCase().includes(q) ||
                photo.prestataire_nom?.toLowerCase().includes(q) ||
                photo.service_name?.toLowerCase().includes(q)
              );
            });

            return displayed.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">{searchPhotos ? 'Aucun résultat' : 'Aucune photo disponible'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayed.map(photo => (
                  <div key={photo.id} onClick={() => setSelectedPhoto(photo)}
                    className="group relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
                    <img src={photo.url} alt={`${photo.photo_type} - ${photo.cemetery_name}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${(photo.photo_type || photo.type) === 'before' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                        {photo.photo_type === 'before' ? '📸 Avant' : '✨ Après'}
                      </span>
                    </div>
                    {/* Infos au survol */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                        <p className="text-sm font-semibold truncate">{photo.cemetery_name}</p>
                        <p className="text-xs opacity-80">{photo.cemetery_city}</p>
                        <p className="text-xs opacity-80 mt-1">#{photo.order_id?.toString().substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Lightbox */}
          {selectedPhoto && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPhoto.photo_type === 'before' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {selectedPhoto.photo_type === 'before' ? '📸 Avant' : '✨ Après'}
                    </span>
                    <h3 className="font-semibold">{selectedPhoto.cemetery_name}</h3>
                  </div>
                  <button onClick={() => setSelectedPhoto(null)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">✕</button>
                </div>

                <div className="p-4">
                  <img src={selectedPhoto.url} alt="Photo intervention" className="w-full max-h-96 object-contain rounded-lg" />
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500">N° commande</p><p className="font-medium font-mono text-xs">{selectedPhoto.order_id}</p></div>
                    <div><p className="text-gray-500">Cimetière</p><p className="font-medium">{selectedPhoto.cemetery_name}</p></div>
                    <div><p className="text-gray-500">Ville</p><p className="font-medium">{selectedPhoto.cemetery_city}</p></div>
                    <div><p className="text-gray-500">Service</p><p className="font-medium">{selectedPhoto.service_name}</p></div>
                    <div>
                      <p className="text-gray-500">Client</p>
                      <p className="font-medium">{selectedPhoto.client_prenom} {selectedPhoto.client_nom}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prestataire</p>
                      <p className="font-medium">{selectedPhoto.prestataire_prenom} {selectedPhoto.prestataire_nom}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Statut commande</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[selectedPhoto.order_status] ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[selectedPhoto.order_status] || selectedPhoto.order_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Date upload</p>
                      <p className="font-medium">{new Date(selectedPhoto.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );

      case 'finances': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Finances</h2>
          {loadingFinances ? <Spinner /> : finances ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: '💰 CA Total plateforme', value: `${finances.revenue.total.toFixed(2)}€`, sub: `${finances.revenue.paid_orders} commandes payées`, from: 'from-green-500', to: 'to-green-600' },
                  { label: '🏦 Commission Mémoria (20%)', value: `${(finances.revenue.total * 0.20).toFixed(2)}€`, sub: 'Revenus de la plateforme', from: 'from-purple-500', to: 'to-purple-600' },
                  { label: '👷 Reversé prestataires (80%)', value: `${(finances.revenue.total * 0.80).toFixed(2)}€`, sub: 'Total reversé', from: 'from-blue-500', to: 'to-blue-600' },
                ].map(kpi => (
                  <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-lg p-6 text-white shadow-lg`}>
                    <h3 className="text-sm font-medium opacity-90 mb-2">{kpi.label}</h3>
                    <p className="text-4xl font-bold mb-1">{kpi.value}</p>
                    <p className="text-sm opacity-80">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Répartition financière par statut</h3>
                <div className="space-y-3">
                  {[
                    { label: '✅ Commandes terminées', status: 'completed', color: 'bg-green-500' },
                    { label: '💳 Commandes payées', status: 'paid', color: 'bg-blue-500' },
                    { label: '💸 Commandes remboursées', status: 'refunded', color: 'bg-red-500' },
                    { label: '🚨 Commandes en litige', status: 'disputed', color: 'bg-orange-500' },
                  ].map(item => {
                    const count = finances.orders.by_status[item.status] || 0;
                    const percentage = Math.round((count / (finances.orders.total || 1)) * 100);
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="font-medium">{count} commande{count > 1 ? 's' : ''} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {finances.monthly_orders?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📈 Évolution mensuelle</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {finances.monthly_orders.map((month, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">{month.month}</p>
                        <p className="text-2xl font-bold mb-1">{month.count}</p>
                        <p className="text-lg font-semibold text-green-600">{month.revenue.toFixed(2)}€</p>
                        <p className="text-xs text-purple-600">Commission: {(month.revenue * 0.20).toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">Impossible de charger les données financières</p>
          )}
        </div>
      );

      case 'cemeteries': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Cimetières</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{cemeteries.length} cimetières</span>
              <button onClick={() => setShowAddCemetery(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">+ Ajouter</button>
            </div>
          </div>

          <div className="relative mb-6">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchCemeteries} onChange={e => setSearchCemeteries(e.target.value)}
              placeholder="Rechercher par nom, ville, département..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {searchCemeteries && (
              <button onClick={() => setSearchCemeteries('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>

          {loadingCemeteries ? <Spinner /> : filteredCemeteries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">{searchCemeteries ? 'Aucun résultat' : 'Aucun cimetière référencé'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCemeteries.map(cemetery => (
                <div key={cemetery.id} onClick={() => setSelectedCemetery(cemetery)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">⛪</div>
                      <div>
                        <p className="font-semibold">{cemetery.name}</p>
                        <p className="text-sm text-gray-500">📍 {cemetery.city}{cemetery.postal_code ? ` — ${cemetery.postal_code}` : ''}{cemetery.department ? ` (${cemetery.department})` : ''}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal fiche cimetière */}
          {selectedCemetery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCemetery(null)}>
              <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold">{selectedCemetery.name}</h3>
                  <button onClick={() => setSelectedCemetery(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <div className="p-6 space-y-2 text-sm">
                  {[
                    ['Ville', selectedCemetery.city],
                    ['Code postal', selectedCemetery.postal_code || 'Non renseigné'],
                    ['Département', selectedCemetery.department || 'Non renseigné'],
                    ['Adresse', selectedCemetery.address || 'Non renseignée'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                  <button onClick={() => setSelectedCemetery(null)}
                    className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">Fermer</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal ajout cimetière */}
          {showAddCemetery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCemetery(false)}>
              <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold">Ajouter un cimetière</h3>
                  <button onClick={() => setShowAddCemetery(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <form onSubmit={handleAddCemetery} className="p-6 space-y-4">
                  {cemeteryError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{cemeteryError}</p></div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input type="text" value={newCemetery.name} onChange={e => setNewCemetery({ ...newCemetery, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Cimetière de..." required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                      <input type="text" value={newCemetery.city} onChange={e => setNewCemetery({ ...newCemetery, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code postal <span className="text-red-500">*</span></label>
                      <input type="text" value={newCemetery.postal_code} onChange={e => setNewCemetery({ ...newCemetery, postal_code: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        pattern="[0-9]{5}" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    <input type="text" value={newCemetery.department} onChange={e => setNewCemetery({ ...newCemetery, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Gironde" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète (optionnel)</label>
                    <input type="text" value={newCemetery.address} onChange={e => setNewCemetery({ ...newCemetery, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <button type="button" onClick={() => { setShowAddCemetery(false); setCemeteryError(null); }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                    <button type="submit" disabled={addingCemetery}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                      {addingCemetery ? 'Ajout...' : '+ Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );

      case 'services': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Services</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{services.length} services</span>
              <button onClick={() => setShowAddService(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">+ Ajouter</button>
            </div>
          </div>

          {loadingServices ? <Spinner /> : services.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">Aucun service référencé</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">🌿</div>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {service.is_active ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm border-t border-gray-100 pt-4">
                    {[
                      { label: 'Prix client', value: service.base_price ? `${parseFloat(service.base_price).toFixed(2)}€` : '-', bg: 'bg-green-50', text: 'text-green-600' },
                      { label: 'Commission 20%', value: service.base_price ? `${(parseFloat(service.base_price) * 0.20).toFixed(2)}€` : '-', bg: 'bg-purple-50', text: 'text-purple-600' },
                      { label: 'Prestataire 80%', value: service.base_price ? `${(parseFloat(service.base_price) * 0.80).toFixed(2)}€` : '-', bg: 'bg-blue-50', text: 'text-blue-600' },
                    ].map(col => (
                      <div key={col.label} className={`text-center p-2 ${col.bg} rounded-lg`}>
                        <p className="text-gray-500 text-xs mb-1">{col.label}</p>
                        <p className={`font-bold text-base ${col.text}`}>{col.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal ajout service */}
          {showAddService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddService(false)}>
              <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold">Ajouter un service</h3>
                  <button onClick={() => setShowAddService(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <form onSubmit={handleAddService} className="p-6 space-y-4">
                  {serviceError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{serviceError}</p></div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service <span className="text-red-500">*</span></label>
                    <input type="text" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Nettoyage de tombe..." required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" rows="3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de base <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="number" step="0.01" min="0.01" value={newService.base_price}
                        onChange={e => setNewService({ ...newService, base_price: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="45.00" required />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <button type="button" onClick={() => { setShowAddService(false); setServiceError(null); }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                    <button type="submit" disabled={addingService}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                      {addingService ? 'Ajout...' : '+ Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );

      case 'users': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Utilisateurs</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
              {clients.length + providers.length} utilisateurs
            </span>
          </div>

          <div className="relative mb-6">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
              placeholder="Rechercher par nom, email, SIRET, zone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {searchUsers && (
              <button onClick={() => setSearchUsers('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[['clients', '👥 Clients', filteredClients.length], ['providers', '🔧 Prestataires', filteredProviders.length]].map(([tab, label, count]) => (
              <button key={tab} onClick={() => setUsersTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${usersTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {label} ({count})
              </button>
            ))}
          </div>

          {loadingUsers ? <Spinner /> : (
            <>
              {/* ── Onglet Clients ── */}
              {usersTab === 'clients' && (
                filteredClients.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{searchUsers ? 'Aucun résultat' : 'Aucun client inscrit'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map(client => (
                      <div key={client.id} onClick={() => setSelectedUser(client)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                              {client.prenom?.[0]}{client.nom?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{client.prenom} {client.nom}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <p className="text-gray-500">Inscrit le</p>
                              <p className="font-medium">{new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500">Commandes</p>
                              <p className="font-medium">{client.orders_count || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Onglet Prestataires ── */}
              {usersTab === 'providers' && (
                filteredProviders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun prestataire inscrit</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProviders.map(provider => (
                      <div key={provider.id} onClick={() => setSelectedUser(provider)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                              {provider.prenom?.[0]}{provider.nom?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{provider.prenom} {provider.nom}</p>
                              <p className="text-sm text-gray-500">{provider.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right"><p className="text-gray-500">SIRET</p><p className="font-medium">{provider.siret || '-'}</p></div>
                            <div className="text-right"><p className="text-gray-500">Zone</p><p className="font-medium">{provider.zone_intervention || '-'}</p></div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {provider.is_verified ? '✅ Vérifié' : '⏳ En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Modal fiche utilisateur/prestataire ── */}
              {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedUser(null)}>
                  <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>

                    {/* En-tête */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${selectedUser.role === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{selectedUser.prenom} {selectedUser.nom}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {selectedUser.role === 'client' ? '👥 Client' : '🔧 Prestataire'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                    </div>

                    {/* Informations */}
                    <div className="p-6 space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{selectedUser.email}</span></div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Inscrit le</span>
                        <span className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Commandes</span>
                        <span className="font-medium">{selectedUser.orders_count || 0}</span>
                      </div>

                      {selectedUser.role === 'client' && selectedUser.orders_count > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Historique</span>
                          <button
                            onClick={async () => {
                              setLoadingClientOrders(true);
                              try {
                                const res = await axios.get('/api/admin/users/' + selectedUser.id + '/orders', authHeaders());
                                setClientOrdersData(res.data.data || []);
                                setSelectedClientOrders(selectedUser);
                              } catch { setClientOrdersData([]); }
                              finally { setLoadingClientOrders(false); }
                            }}
                            className="text-purple-600 hover:underline text-sm font-medium">
                            {loadingClientOrders ? 'Chargement...' : 'Voir les commandes →'}
                          </button>
                        </div>
                      )}

                      {selectedUser.role === 'prestataire' && (
                        <>
                          <div className="flex justify-between"><span className="text-gray-500">SIRET</span><span className="font-medium">{selectedUser.siret || '-'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Zone</span><span className="font-medium">{selectedUser.zone_intervention || '-'}</span></div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Statut</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {selectedUser.is_verified ? '✅ Vérifié' : '⏳ En attente'}
                            </span>
                          </div>
                          {selectedUser.rating && (
                            <div className="flex justify-between"><span className="text-gray-500">Note moyenne</span><span className="font-medium">⭐ {parseFloat(selectedUser.rating).toFixed(1)}/5</span></div>
                          )}
                          {selectedUser.is_verified && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Planning</span>
                              <button
                                onClick={() => { setSelectedUser(null); setSelectedProviderCalendar(selectedUser.id); setSelectedProviderInfo(selectedUser); fetchProviderCalendar(selectedUser.id); }}
                                className="text-purple-600 hover:underline text-sm font-medium">
                                Voir le planning →
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Erreurs */}
                      {blockError[selectedUser.id] && <p className="text-red-600 text-sm">{blockError[selectedUser.id]}</p>}
                      {deleteError[selectedUser.id] && <p className="text-red-600 text-sm">{deleteError[selectedUser.id]}</p>}
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">
                      <button
                        onClick={async () => {
                          try {
                            await axios.patch(`/api/admin/users/${selectedUser.id}/toggle-block`, {}, authHeaders());
                            setSelectedUser(null);
                            fetchAllUsers();
                          } catch (err) {
                            setBlockError(prev => ({ ...prev, [selectedUser.id]: err.response?.data?.error?.message || 'Erreur' }));
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">
                        {selectedUser.is_blocked ? '🔓 Débloquer' : '🔒 Bloquer'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Supprimer définitivement le compte de ${selectedUser.prenom} ${selectedUser.nom} ?`)) return;
                          try {
                            await axios.delete(`/api/admin/users/${selectedUser.id}`, authHeaders());
                            setSelectedUser(null);
                            fetchAllUsers();
                          } catch (err) {
                            setDeleteError(prev => ({ ...prev, [selectedUser.id]: err.response?.data?.error?.message || 'Erreur' }));
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                        🗑️ Supprimer
                      </button>
                      <button onClick={() => setSelectedUser(null)}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                        Fermer
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Modal commandes client */}
              {selectedClientOrders && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4"
                  onClick={() => setSelectedClientOrders(null)}>
                  <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                      <h3 className="text-lg font-bold">Commandes de {selectedClientOrders.prenom} {selectedClientOrders.nom}</h3>
                      <button onClick={() => setSelectedClientOrders(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                    </div>
                    <div className="p-6">
                      {clientOrdersData.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Aucune commande</p>
                      ) : (
                        <div className="space-y-3">
                          {clientOrdersData.map(order => (
                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{order.service_name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                                  {STATUS_LABELS[order.status] || order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">📍 {order.cemetery_name}</p>
                              <p className="text-sm text-gray-600">📅 {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                              <p className="text-sm font-bold text-purple-600 mt-1">{parseFloat(order.price).toFixed(2)}€</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                      <button onClick={() => setSelectedClientOrders(null)}
                        className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );

      case 'disputes': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Litiges & Corrections</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                {disputedOrders.length} litige{disputedOrders.length > 1 ? 's' : ''}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                {allOrders.filter(o => o.status === 'in_progress').length} en correction
              </span>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              ['disputes', '🚨 Litiges', disputedOrders.length],
              ['correction', '🔄 Missions en correction', allOrders.filter(o => o.status === 'correction_requested').length]
            ].map(([tab, label, count]) => (
              <button key={tab} onClick={() => setDisputesTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${disputesTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                {label} ({count})
              </button>
            ))}
          </div>

          {/* ── Onglet Litiges ── */}
          {disputesTab === 'disputes' && (
            loadingDisputes ? <Spinner /> : disputedOrders.length === 0 ? (
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
                        <div><p className="text-sm text-gray-500">Client</p><p className="font-medium">{order.client_prenom} {order.client_nom}</p></div>
                        <div><p className="text-sm text-gray-500">Prestataire</p><p className="font-medium">{order.prestataire_prenom} {order.prestataire_nom}</p></div>
                      </div>
                      <div className="mb-4 p-3 bg-white rounded border border-red-200">
                        <p className="text-sm font-medium text-red-900 mb-1">Motif :</p>
                        <p className="text-sm">{order.dispute_reason}</p>
                      </div>
                      {(beforePhoto || afterPhoto) && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {beforePhoto && <div><p className="text-sm font-medium mb-2">📸 Avant</p><img src={beforePhoto.url} alt="Avant" className="w-full h-48 object-cover rounded-lg" /></div>}
                          {afterPhoto && <div><p className="text-sm font-medium mb-2">✨ Après</p><img src={afterPhoto.url} alt="Après" className="w-full h-48 object-cover rounded-lg" /></div>}
                        </div>
                      )}
                      {resolveError[order.id] && (
                        <div className="mb-3 bg-red-100 border border-red-300 rounded-lg p-3">
                          <p className="text-red-800 text-sm">{resolveError[order.id]}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleResolveDispute(order.id, 'validate')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">✓ Valider</button>
                        <button onClick={() => handleResolveDispute(order.id, 'request_correction')} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">🔄 Correction</button>
                        <button onClick={() => handleResolveDispute(order.id, 'refund')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">💸 Rembourser</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── Onglet Missions en correction ── */}
          {disputesTab === 'correction' && (
            allOrders.filter(o => o.status === 'correction_requested' || o.status === 'correction_submitted').length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Aucune mission en correction</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allOrders.filter(o => o.status === 'correction_requested' || o.status === 'correction_submitted').map(order => (
                  <div key={order.id} className={`border-2 rounded-lg p-6 ${order.status === 'correction_submitted'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-orange-200 bg-orange-50'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">{order.cemetery_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'correction_submitted'
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-600 text-white'
                        }`}>
                        {order.status === 'correction_submitted' ? '📋 Correction soumise' : '⚠️ Correction demandée'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-sm text-gray-500">Client</p><p className="font-medium">{order.client_prenom} {order.client_nom}</p></div>
                      <div><p className="text-sm text-gray-500">Prestataire</p><p className="font-medium">{order.prestataire_prenom} {order.prestataire_nom}</p></div>
                      <div><p className="text-sm text-gray-500">Service</p><p className="font-medium">{order.service_name}</p></div>
                      <div><p className="text-sm text-gray-500">Prix</p><p className="font-bold">{parseFloat(order.price).toFixed(2)}€</p></div>
                      <div><p className="text-sm text-gray-500">Commande créée le</p><p className="font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p></div>
                    </div>

                    {order.correction_reason && (
                      <div className="mb-4 p-3 bg-white rounded border border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-1">Motif de correction :</p>
                        <p className="text-sm">{order.correction_reason}</p>
                      </div>
                    )}

                    {/* Boutons — uniquement si correction soumise */}
                    {order.status === 'correction_submitted' && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={() => handleResolveDispute(order.id, 'validate')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                          ✓ Valider la correction
                        </button>
                        <button onClick={() => handleResolveDispute(order.id, 'request_correction')}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                          🔄 Nouvelle correction
                        </button>
                      </div>
                    )}

                    {resolveError[order.id] && (
                      <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{resolveError[order.id]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      );

      case 'interventions': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Interventions à valider</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{pendingOrders.length} en attente</span>
          </div>
          {loadingOrders ? <Spinner /> : pendingOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">Aucune intervention en attente</p></div>
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
                      <div><p className="text-sm text-gray-500">Client</p><p className="font-medium">{order.client_email}</p></div>
                      <div><p className="text-sm text-gray-500">Prestataire</p><p className="font-medium">{order.prestataire_prenom} {order.prestataire_nom}</p></div>
                      <div><p className="text-sm text-gray-500">Service</p><p className="font-medium">{order.service_name}</p></div>
                      <div>
                        <p className="text-sm text-gray-500">Date planifiée</p>
                        <p className="font-medium">
                          {order.scheduled_date
                            ? `${new Date(order.scheduled_date).toLocaleDateString('fr-FR')} à ${order.scheduled_time?.substring(0, 5) || '-'}`
                            : 'Non planifiée'}
                        </p>
                      </div>
                      <div><p className="text-sm text-gray-500">Montant</p><p className="font-medium">{order.price}€</p></div>
                    </div>

                    <button onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {selectedOrder === order.id ? '▼ Masquer les photos' : '▶ Voir les photos'}
                    </button>

                    {selectedOrder === order.id && (
                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        {beforePhoto
                          ? <div><p className="text-sm font-medium mb-2">📸 Avant</p><img src={beforePhoto.url} alt="Avant" className="w-full h-64 object-cover rounded-lg" /></div>
                          : <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg"><p className="text-gray-500">Photo avant manquante</p></div>}
                        {afterPhoto
                          ? <div><p className="text-sm font-medium mb-2">✨ Après</p><img src={afterPhoto.url} alt="Après" className="w-full h-64 object-cover rounded-lg" /></div>
                          : <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg"><p className="text-gray-500">Photo après manquante</p></div>}
                      </div>
                    )}

                    {validateError[order.id] && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{validateError[order.id]}</p></div>}

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleValidateOrder(order.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
                        ✓ Valider ({(parseFloat(order.price) * 0.80).toFixed(2)}€ → prestataire)
                      </button>
                      <button onClick={() => { setShowDisputeModal(order.id); setDisputeError(null); }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition">
                        🚨 Marquer comme litigieux
                      </button>
                    </div>

                    {/* Modal litige inline */}
                    {showDisputeModal === order.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">Marquer comme litigieux</h3>
                          {disputeError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{disputeError}</p></div>}
                          <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4" rows="4"
                            placeholder="Ex: Photos floues, travail incomplet... (min 10 caractères)" />
                          <div className="flex gap-3">
                            <button onClick={() => { setShowDisputeModal(null); setDisputeReason(''); setDisputeError(null); }}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">Annuler</button>
                            <button onClick={() => handleMarkAsDisputed(order.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Confirmer</button>
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
      );

      case 'documents': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Documents prestataires</h2>
            <div className="flex gap-3 items-center">
              {unreadDocs > 0 && (
                <button
                  onClick={async () => {
                    await axios.patch('/api/documents/admin/all', {}, authHeaders());
                    setUnreadDocs(0);
                    fetchAllProviderDocs();
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                  ✅ Tout marquer comme lu ({unreadDocs})
                </button>
              )}
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {allProviderDocs.length} document{allProviderDocs.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchDocs}
              onChange={e => setSearchDocs(e.target.value)}
              placeholder="Rechercher par nom, email..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={filterDocType} onChange={e => setFilterDocType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous les types</option>
              <option value="rib">RIB</option>
              <option value="kbis">Kbis</option>
              <option value="assurance">Assurance RC</option>
              <option value="identite">Pièce d'identité</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {loadingAllDocs ? <Spinner /> : (() => {
            // Filtrage combiné recherche + type
            const filtered = allProviderDocs.filter(doc => {
              const matchSearch = searchDocs.trim() === '' ||
                `${doc.prenom} ${doc.nom} ${doc.email}`.toLowerCase().includes(searchDocs.toLowerCase());
              const matchType = filterDocType === 'all' || doc.type === filterDocType;
              return matchSearch && matchType;
            });

            if (filtered.length === 0) return (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-4xl mb-2">📄</p>
                <p className="text-gray-600">Aucun document trouvé</p>
              </div>
            );

            // Groupement par prestataire
            const grouped = filtered.reduce((acc, doc) => {
              const key = doc.user_id;
              if (!acc[key]) acc[key] = { prenom: doc.prenom, nom: doc.nom, email: doc.email, docs: [] };
              acc[key].docs.push(doc);
              return acc;
            }, {});

            return (
              <div className="space-y-4">
                {Object.entries(grouped).map(([userId, { prenom, nom, email, docs }]) => (
                  <div key={userId} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{prenom} {nom}</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {docs.length} document{docs.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📄</span>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {doc.type === 'rib' ? 'RIB' :
                                  doc.type === 'kbis' ? 'Kbis' :
                                    doc.type === 'assurance' ? 'Assurance RC' :
                                      doc.type === 'identite' ? "Pièce d'identité" :
                                        doc.label || 'Autre'}
                              </p>
                              <p className="text-xs text-gray-500">{doc.file_name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium">
                              👁️ Consulter
                            </a>
                            <button
                              onClick={async () => {
                                if (!window.confirm('Supprimer ce document ?')) return;
                                await axios.delete(`/api/documents/admin/${doc.id}`, authHeaders());
                                fetchAllProviderDocs();
                                fetchUnreadDocs();
                              }}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium">
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      );

      case 'providers': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Prestataires à valider</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              {pendingProviders.length} en attente
            </span>
          </div>
          {loadingProviders ? <Spinner /> : pendingProviders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun prestataire en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProviders.map(provider => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">{provider.prenom} {provider.nom}</h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{provider.email}</p></div>
                    <div><p className="text-sm text-gray-500">SIRET</p><p className="font-medium">{provider.siret || '-'}</p></div>
                    <div><p className="text-sm text-gray-500">Zone</p><p className="font-medium">{provider.zone_intervention || '-'}</p></div>
                    <div><p className="text-sm text-gray-500">Téléphone</p><p className="font-medium">{provider.telephone || '-'}</p></div>
                  </div>

                  {/* ── Documents prestataire ─────────────────────── */}
                  <div className="mb-4">
                    <button
                      onClick={() => fetchProviderDocuments(provider.id)}
                      disabled={loadingProviderDocs[provider.id]}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition disabled:opacity-50">
                      {loadingProviderDocs[provider.id] ? '⏳ Chargement...' :
                        expandedProviderDocs[provider.id] ? '🔼 Masquer les documents' : '📄 Voir les documents'}
                    </button>

                    {expandedProviderDocs[provider.id] && (
                      <div className="mt-3">
                        {!providerDocuments[provider.id] || providerDocuments[provider.id].length === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-yellow-800 text-sm">⚠️ Aucun document fourni par ce prestataire</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {providerDocuments[provider.id].map(doc => (
                              <div key={doc.id}
                                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">📄</span>
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">
                                      {doc.type === 'rib' ? 'RIB' :
                                        doc.type === 'kbis' ? 'Kbis' :
                                          doc.type === 'assurance' ? 'Assurance RC' :
                                            doc.type === 'identite' ? "Pièce d'identité" :
                                              doc.label || 'Autre'}
                                    </p>
                                    <p className="text-xs text-gray-500">{doc.file_name}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium">
                                  👁️ Consulter
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {approveError[provider.id] && (
                    <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{approveError[provider.id]}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => handleApproveProvider(provider.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
                      ✓ Valider
                    </button>
                    <button onClick={() => { setShowRejectModal(provider.id); setRejectError(null); }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                      ✗ Rejeter
                    </button>
                  </div>

                  {/* Modal rejet inline */}
                  {showRejectModal === provider.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Rejeter le prestataire</h3>
                        {rejectError && (
                          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm">{rejectError}</p>
                          </div>
                        )}
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 mb-4" rows="4"
                          placeholder="Ex: Documents incomplets... (min 10 caractères)" />
                        <div className="flex gap-3">
                          <button onClick={() => { setShowRejectModal(null); setRejectReason(''); setRejectError(null); }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">Annuler</button>
                          <button onClick={() => handleRejectProvider(provider.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Confirmer</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  // ─── Rendu principal ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 bg-purple-50 px-6 py-8 pt-32 pl-24 w-full">

        {/* Sidebar iconique fixe */}
        <aside className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col items-center pt-28 pb-6 gap-1">
          {NAV_SECTIONS.map(({ key, label }) => {
            const icons = {
              overview: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
              messages: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
              disputes: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
              interventions: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              providers: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              users: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
              gallery: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
              finances: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              cemeteries: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              services: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
              documents: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
              history: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            };

            const badge =
              key === 'disputes' && disputedOrders.length > 0 ? disputedOrders.length :
                key === 'interventions' && pendingOrders.length > 0 ? pendingOrders.length :
                  key === 'providers' && pendingProviders.length > 0 ? pendingProviders.length :
                    key === 'messages' && (unreadMessages + unreadContactNotifs) > 0 ? (unreadMessages + unreadContactNotifs) :
                      key === 'documents' && unreadDocs > 0 ? unreadDocs :
                        null;

            return (
              <div key={key} className="relative group w-full flex justify-center">
                <button
                  onClick={() => setActiveSection(key)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeSection === key
                      ? 'bg-purple-700 text-white shadow-md'
                      : 'text-gray-400 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                >
                  {icons[key]}
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badge}
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5
                bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg
                whitespace-nowrap pointer-events-none
                opacity-0 group-hover:opacity-100
                translate-x-1 group-hover:translate-x-0
                transition-all duration-200 z-50">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2
                  border-4 border-transparent border-r-slate-800" />
                </div>
              </div>
            );
          })}
        </aside>

        {/* Contenu */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Dashboard Administrateur</h1>
            {user && <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>}
          </div>
          {renderSection()}
        </section>

      </main>

      {/* Modal calendrier prestataire */}
      {selectedProviderCalendar && selectedProviderInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeProviderCalendar}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                  {selectedProviderInfo.prenom?.[0]}{selectedProviderInfo.nom?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Planning de {selectedProviderInfo.prenom} {selectedProviderInfo.nom}</h3>
                  <p className="text-sm text-gray-500">{selectedProviderInfo.email}</p>
                </div>
              </div>
              <button onClick={closeProviderCalendar} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
            </div>

            <div className="p-6">
              {loadingProviderCalendar ? <Spinner /> : providerCalendarData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">Aucune mission planifiée</p></div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    providerCalendarData.reduce((acc, m) => {
                      if (!acc[m.scheduled_date]) acc[m.scheduled_date] = [];
                      acc[m.scheduled_date].push(m);
                      return acc;
                    }, {})
                  ).map(([date, missions]) => (
                    <div key={date} className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                        <div className="bg-purple-100 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-purple-600">{new Date(date).getDate()}</p>
                          <p className="text-xs text-purple-700">{new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                        </div>
                        <p className="font-semibold">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="space-y-3">
                        {[...missions].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)).map(mission => {
                          const startTime = mission.scheduled_time.substring(0, 5);
                          const duration = parseFloat(mission.duration_hours) || 2;
                          const [h, m] = mission.scheduled_time.split(':').map(Number);
                          const endMin = h * 60 + m + duration * 60;
                          const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
                          return (
                            <div key={mission.id}
                              onClick={() => setSelectedMission(mission)}
                              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 hover:border hover:border-purple-200 transition">
                              <div className="text-center min-w-[80px]">
                                <p className="text-lg font-bold text-purple-600">{startTime}</p>
                                <p className="text-xs text-gray-500">↓ {duration}h</p>
                                <p className="text-sm text-gray-600">{endTime}</p>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{mission.cemetery_name}</h4>
                                <p className="text-sm text-gray-600">📍 {mission.cemetery_city}</p>
                                <p className="text-sm text-gray-600">🔧 {mission.service_name}</p>
                                <p className="text-sm text-gray-600">👤 {mission.client_prenom} {mission.client_nom}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-purple-600">{parseFloat(mission.price).toFixed(2)}€</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal détail mission */}
            {selectedMission && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4"
                onClick={() => setSelectedMission(null)}>
                <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-bold">Détail de la mission</h3>
                    <button onClick={() => setSelectedMission(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{selectedMission.service_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cimetière</span><span className="font-medium">{selectedMission.cemetery_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ville</span><span className="font-medium">{selectedMission.cemetery_city}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-medium">{selectedMission.client_prenom} {selectedMission.client_nom}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(selectedMission.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Heure</span><span className="font-medium">{selectedMission.scheduled_time?.substring(0, 5)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Durée</span><span className="font-medium">{selectedMission.duration_hours}h</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Prix</span><span className="font-bold text-purple-600">{parseFloat(selectedMission.price).toFixed(2)}€</span></div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Statut</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[selectedMission.status] ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[selectedMission.status] || selectedMission.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                    <button onClick={() => setSelectedMission(null)}
                      className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-t bg-gray-50 rounded-b-xl">
              <button onClick={closeProviderCalendar}
                className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;
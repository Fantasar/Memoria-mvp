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
  const [allOrders, setAllOrders] = useState([]);
  const [loadingAllOrders, setLoadingAllOrders] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');

  //Gestion des sous onglet pour les Utilisateurs
  const [clients, setClients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersTab, setUsersTab] = useState('clients');
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  //Gestion des cimetières - Ajout
  const [showAddCemetery, setShowAddCemetery] = useState(false);
  const [selectedCemetery, setSelectedCemetery] = useState(null);
  const [newCemetery, setNewCemetery] = useState({ name: '', city: '', postal_code: '', department: '' });
  const [addingCemetery, setAddingCemetery] = useState(false);

  // Gestion des onglets finances - Cimetière - Service
  const [finances, setFinances] = useState(null);
  const [cemeteries, setCemeteries] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingFinances, setLoadingFinances] = useState(true);
  const [loadingCemeteries, setLoadingCemeteries] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [searchCemeteries, setSearchCemeteries] = useState('');

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
  const [allPhotos, setAllPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoFilter, setPhotoFilter] = useState('all');

  // Charger toutes les données au montage
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

  const fetchAllPhotos = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/photos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllPhotos(response.data.data || []);
    } catch (err) {
      console.error('Erreur galerie photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllOrders(response.data.data || []);
    } catch (err) {
      console.error('Erreur historique:', err);
    } finally {
      setLoadingAllOrders(false);
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

  const fetchAllUsers = async () => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

    const allUsers = response.data.data || [];
      setClients(allUsers.filter(u => u.role === 'client'));
      setProviders(allUsers.filter(u => u.role === 'prestataire'));
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchFinances = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFinances(response.data.data);
  } catch (err) {
    console.error('Erreur finances:', err);
  } finally {
    setLoadingFinances(false);
  }
};

const fetchCemeteries = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/cemeteries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCemeteries(response.data.data || []);
  } catch (err) {
    console.error('Erreur cimetières:', err);
  } finally {
    setLoadingCemeteries(false);
  }
};

const fetchServices = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/service-categories/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setServices(response.data.data || []);
  } catch (err) {
    console.error('Erreur services:', err);
  } finally {
    setLoadingServices(false);
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

  // Config des badges de statut
  const statusConfig = {
    pending: { label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: '💳 Payée', color: 'bg-blue-100 text-blue-800' },
    accepted: { label: '🔄 Acceptée', color: 'bg-green-100 text-green-800' },
    in_progress: { label: '🔄 En cours', color: 'bg-purple-100 text-purple-800' },
    awaiting_validation: { label: '⏰ À valider', color: 'bg-orange-100 text-orange-800' },
    completed: { label: '✅ Terminée', color: 'bg-green-200 text-green-900' },
    disputed: { label: '🚨 Litige', color: 'bg-red-100 text-red-800' },
    cancelled: { label: '❌ Annulée', color: 'bg-gray-100 text-gray-800' },
    refunded: { label: '💸 Remboursée', color: 'bg-indigo-100 text-indigo-800' },
  };

  // Commandes filtrées selon le statut sélectionné
  const filteredOrders = historyFilter === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === historyFilter);

  // Filtre les photos pour la galerie
  const filteredPhotos = photoFilter === 'all'
    ? allPhotos
    : allPhotos.filter(photo => (photo.photo_type || photo.type) === photoFilter);

  const filteredClients = clients.filter(c =>
    `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    `${p.prenom} ${p.nom} ${p.email} ${p.siret || ''} ${p.zone_intervention || ''}`.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredCemeteries = cemeteries.filter(c =>
    `${c.name} ${c.city} ${c.department || ''}`.toLowerCase().includes(searchCemeteries.toLowerCase())
  );

const handleAddCemetery = async (e) => {
  e.preventDefault();
  
  if (!newCemetery.name || !newCemetery.city || !newCemetery.postal_code) {
    alert('Nom, ville et code postal sont obligatoires');
    return;
  }
  
  setAddingCemetery(true);
  
  try {
    const token = localStorage.getItem('token');
    await axios.post('/api/cemeteries', newCemetery, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Cimetière ajouté avec succès !');
    setShowAddCemetery(false);
    setNewCemetery({ name: '', city: '', postal_code: '', department: '' });
    fetchCemeteries();
  } catch (err) {
    console.error('Erreur ajout cimetière:', err);
    if (err.response?.data?.error?.code === 'DUPLICATE_CEMETERY') {
      alert('Ce cimetière existe déjà dans cette ville');
    } else {
      alert(err.response?.data?.error?.message || 'Erreur lors de l\'ajout');
    }
  } finally {
    setAddingCemetery(false);
  }
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

    history: (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Historique de la plateforme</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {allOrders.length} commande{allOrders.length > 1 ? 's' : ''} au total
          </span>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {['all', 'pending', 'paid', 'accepted', 'awaiting_validation', 'completed', 'disputed', 'cancelled', 'refunded'].map(status => (
            <button
              key={status}
              onClick={() => setHistoryFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                historyFilter === status 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'Toutes'}
              {status === 'pending' && '⏳ En attente'}
              {status === 'paid' && '💳 Payées'}
              {status === 'accepted' && '🔄 Acceptées'}
              {status === 'awaiting_validation' && '⏰ À valider'}
              {status === 'completed' && '✅ Terminées'}
              {status === 'disputed' && '🚨 Litiges'}
              {status === 'cancelled' && '❌ Annulées'}
              {status === 'refunded' && '💸 Remboursées'}
            </button>
          ))}
        </div>

        {loadingAllOrders ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{order.cemetery_name || 'Cimetière'}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Client</p>
                    <p className="font-medium">{order.client_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Prestataire</p>
                    <p className="font-medium">{order.prestataire_email || 'Non assigné'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Service</p>
                    <p className="font-medium">{order.service_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Montant</p>
                    <p className="font-medium text-green-600">{order.price ? `${parseFloat(order.price).toFixed(2)}€` : '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    gallery: (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Galerie photos</h2>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {allPhotos.length} photo{allPhotos.length > 1 ? 's' : ''}
      </span>
    </div>

    {/* Filtres avant/après */}
    <div className="flex gap-3 mb-6">
      {['all', 'before', 'after'].map(type => (
        <button
          key={type}
          onClick={() => setPhotoFilter(type)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            photoFilter === type
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {type === 'all' && '🖼️ Toutes'}
          {type === 'before' && '📸 Avant'}
          {type === 'after' && '✨ Après'}
        </button>
      ))}
    </div>

    {loadingPhotos ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : filteredPhotos.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune photo disponible</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map(photo => (
          <div 
            key={photo.id} 
            className="group relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Image */}
            <img 
              src={photo.url} 
              alt={`${photo.photo_type} - ${photo.cemetery_name}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badge type */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                (photo.photo_type || photo.type) === 'before' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {photo.photo_type === 'before' ? '📸 Avant' : '✨ Après'}
              </span>
            </div>

            {/* Overlay avec infos */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-semibold">{photo.cemetery_name}</p>
                <p className="text-xs opacity-80">{photo.cemetery_city}</p>
                <p className="text-xs opacity-80">{photo.service_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* LIGHTBOX */}
    {selectedPhoto && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedPhoto(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header lightbox */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedPhoto.photo_type === 'before'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedPhoto.photo_type === 'before' ? '📸 Avant' : '✨ Après'}
              </span>
              <h3 className="font-semibold text-gray-900">{selectedPhoto.cemetery_name}</h3>
            </div>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Image grande */}
          <div className="p-4">
            <img 
              src={selectedPhoto.url} 
              alt="Photo intervention" 
              className="w-full max-h-96 object-contain rounded-lg"
            />
          </div>

          {/* Infos détaillées */}
          <div className="p-4 border-t bg-gray-50 rounded-b-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Cimetière</p>
                <p className="font-medium">{selectedPhoto.cemetery_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Ville</p>
                <p className="font-medium">{selectedPhoto.cemetery_city}</p>
              </div>
              <div>
                <p className="text-gray-500">Service</p>
                <p className="font-medium">{selectedPhoto.service_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Prestataire</p>
                <p className="font-medium">
                  {selectedPhoto.prestataire_prenom && selectedPhoto.prestataire_nom
                    ? `${selectedPhoto.prestataire_prenom} ${selectedPhoto.prestataire_nom}`
                    : selectedPhoto.prestataire_email || 'Non assigné'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Statut commande</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[selectedPhoto.order_status]?.color}`}>
                  {statusConfig[selectedPhoto.order_status]?.label}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Uploadée le</p>
                <p className="font-medium">{new Date(selectedPhoto.uploaded_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-500">Montant</p>
                <p className="font-medium text-green-600">{selectedPhoto.price ? `${parseFloat(selectedPhoto.price).toFixed(2)}€` : '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Client</p>
                <p className="font-medium">{selectedPhoto.client_email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
),

finances: (
  <div>
    <h2 className="text-2xl font-semibold mb-6">Finances</h2>

    {loadingFinances ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : finances ? (
      <>
        {/* KPIs financiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">💰 CA Total plateforme</h3>
            <p className="text-4xl font-bold mb-1">{finances.revenue.total.toFixed(2)}€</p>
            <p className="text-sm opacity-80">{finances.revenue.paid_orders} commandes payées</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">🏦 Commission Mémoria (20%)</h3>
            <p className="text-4xl font-bold mb-1">
              {(finances.revenue.total * 0.20).toFixed(2)}€
            </p>
            <p className="text-sm opacity-80">Revenus de la plateforme</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">👷 Reversé prestataires (80%)</h3>
            <p className="text-4xl font-bold mb-1">
              {(finances.revenue.total * 0.80).toFixed(2)}€
            </p>
            <p className="text-sm opacity-80">Total reversé</p>
          </div>
        </div>

        {/* Répartition par statut */}
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
              const total = finances.orders.total || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium">{count} commande{count > 1 ? 's' : ''} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Évolution mensuelle */}
        {finances.monthly_orders?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Évolution mensuelle</h3>
            <div className="grid grid-cols-3 gap-4">
              {finances.monthly_orders.map((month, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">{month.month}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{month.count}</p>
                  <p className="text-xs text-gray-500 mb-2">commandes</p>
                  <p className="text-lg font-semibold text-green-600">{month.revenue.toFixed(2)}€</p>
                  <p className="text-xs text-purple-600">
                    Commission: {(month.revenue * 0.20).toFixed(2)}€
                  </p>
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
),

cemeteries: (
  <div>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Cimetières</h2>
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {cemeteries.length} cimetière{cemeteries.length > 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowAddCemetery(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
        >
          + Ajouter
        </button>
      </div>
    </div>

    {/* Barre de recherche */}
    <div className="relative mb-6">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={searchCemeteries}
        onChange={(e) => setSearchCemeteries(e.target.value)}
        placeholder="Rechercher par nom, ville, département..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {searchCemeteries && (
        <button onClick={() => setSearchCemeteries('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
      )}
    </div>

    {loadingCemeteries ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : filteredCemeteries.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">{searchCemeteries ? 'Aucun résultat' : 'Aucun cimetière référencé'}</p>
      </div>
    ) : (
      <div className="space-y-3">
        {filteredCemeteries.map(cemetery => (
          <div
            key={cemetery.id}
            onClick={() => setSelectedCemetery(cemetery)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">⛪</div>
                <div>
                  <p className="font-semibold text-gray-900">{cemetery.name}</p>
                  <p className="text-sm text-gray-500">
                    📍 {cemetery.city}
                    {cemetery.postal_code ? ` — ${cemetery.postal_code}` : ''}
                    {cemetery.department ? ` (${cemetery.department})` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {cemetery.orders_count !== undefined && (
                  <div className="text-right">
                    <p className="text-gray-500">Commandes</p>
                    <p className="font-bold text-purple-600">{cemetery.orders_count}</p>
                  </div>
                )}
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ===== MODAL FICHE CIMETIÈRE ===== */}
    {selectedCemetery && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCemetery(null)}>
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-3xl">⛪</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCemetery.name}</h3>
                <p className="text-sm text-gray-500">📍 {selectedCemetery.city}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCemetery(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Informations</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nom</span>
                  <span className="font-medium">{selectedCemetery.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ville</span>
                  <span className="font-medium">{selectedCemetery.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Code postal</span>
                  <span className="font-medium">{selectedCemetery.postal_code || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Département</span>
                  <span className="font-medium">{selectedCemetery.department || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Adresse</span>
                  <span className="font-medium">{selectedCemetery.address || 'Non renseignée'}</span>
                </div>
                {selectedCemetery.orders_count !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nb commandes</span>
                    <span className="font-bold text-purple-600">{selectedCemetery.orders_count}</span>
                  </div>
                )}
                {selectedCemetery.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ajouté le</span>
                    <span className="font-medium">
                      {new Date(selectedCemetery.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 rounded-b-xl">
            <button onClick={() => setSelectedCemetery(null)} className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}

{/* ===== MODAL AJOUT CIMETIÈRE ===== */}
{showAddCemetery && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCemetery(false)}>
    <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-bold text-gray-900">Ajouter un cimetière</h3>
        <button onClick={() => setShowAddCemetery(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
      </div>

      <form onSubmit={handleAddCemetery} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newCemetery.name}
            onChange={e => setNewCemetery({ ...newCemetery, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Cimetière de..."
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCemetery.city}
              onChange={e => setNewCemetery({ ...newCemetery, city: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Bordeaux"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code postal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCemetery.postal_code}
              onChange={e => setNewCemetery({ ...newCemetery, postal_code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="33000"
              pattern="[0-9]{5}"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
          <input
            type="text"
            value={newCemetery.department}
            onChange={e => setNewCemetery({ ...newCemetery, department: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Gironde"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setShowAddCemetery(false);
              setNewCemetery({ name: '', city: '', postal_code: '', department: '' });
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={addingCemetery}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {addingCemetery ? 'Ajout...' : '+ Ajouter'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
  </div>
),

services: (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Services</h2>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {services.length} service{services.length > 1 ? 's' : ''}
      </span>
    </div>

    {loadingServices ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : services.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucun service référencé</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  🌿
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                service.is_active !== false
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {service.is_active !== false ? '✅ Actif' : '❌ Inactif'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
              <div>
                <p className="text-gray-500">Prix de base</p>
                <p className="font-bold text-green-600 text-lg">
                  {service.base_price ? `${parseFloat(service.base_price).toFixed(2)}€` : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Commission (20%)</p>
                <p className="font-bold text-purple-600 text-lg">
                  {service.base_price ? `${(parseFloat(service.base_price) * 0.20).toFixed(2)}€` : '-'}
                </p>
              </div>
              {service.orders_count !== undefined && (
                <div>
                  <p className="text-gray-500">Commandes totales</p>
                  <p className="font-medium text-gray-900">{service.orders_count}</p>
                </div>
              )}
              {service.duration_minutes && (
                <div>
                  <p className="text-gray-500">Durée estimée</p>
                  <p className="font-medium text-gray-900">{service.duration_minutes} min</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
),


users: (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Utilisateurs</h2>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {clients.length + providers.length} utilisateurs
      </span>
    </div>

    {/* Barre de recherche */}
    <div className="relative mb-6">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={searchUsers}
        onChange={(e) => setSearchUsers(e.target.value)}
        placeholder="Rechercher par nom, email, SIRET, zone..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {searchUsers && (
        <button
          onClick={() => setSearchUsers('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>

    {/* Sous-onglets */}
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      <button
        onClick={() => setUsersTab('clients')}
        className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${
          usersTab === 'clients'
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        👥 Clients ({filteredClients.length})
      </button>
      <button
        onClick={() => setUsersTab('providers')}
        className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${
          usersTab === 'providers'
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        🔧 Prestataires ({filteredProviders.length})
      </button>
    </div>

    {loadingUsers ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : (
      <>
        {/* ===== LISTE CLIENTS ===== */}
        {usersTab === 'clients' && (
          <div>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {searchUsers ? 'Aucun résultat pour cette recherche' : 'Aucun client inscrit'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedUser(client)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                          {client.prenom?.[0]}{client.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.prenom} {client.nom}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-gray-500">Inscrit le</p>
                          <p className="font-medium">{new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.is_verified ? '✅ Vérifié' : '⏳ Non vérifié'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== LISTE PRESTATAIRES ===== */}
        {usersTab === 'providers' && (
          <div>
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {searchUsers ? 'Aucun résultat pour cette recherche' : 'Aucun prestataire inscrit'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProviders.map(provider => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedUser(provider)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                          {provider.prenom?.[0]}{provider.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{provider.prenom} {provider.nom}</p>
                          <p className="text-sm text-gray-500">{provider.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-gray-500">Zone</p>
                          <p className="font-medium">{provider.zone_intervention || 'Non définie'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Note</p>
                          <p className="font-medium">{provider.rating ? `⭐ ${provider.rating}` : '-'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {provider.is_verified ? '✅ Vérifié' : '⏳ En attente'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {provider.rejection_reason && (
                      <div className="mt-3 pt-3 border-t border-red-100 bg-red-50 rounded p-2">
                        <p className="text-xs text-red-700">❌ Rejeté : {provider.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    )}

    {/* ===== MODAL FICHE UTILISATEUR ===== */}
    {selectedUser && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedUser(null)}
      >
        <div
          className="bg-white rounded-xl max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header modal */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
                selectedUser.role === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUser.prenom} {selectedUser.nom}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUser.role === 'client' ? '👥 Client' : '🔧 Prestataire'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Contenu modal */}
          <div className="p-6 space-y-4">

            {/* Infos générales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Informations générales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Inscrit le</span>
                  <span className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.is_verified ? '✅ Vérifié' : '⏳ Non vérifié'}
                  </span>
                </div>
              </div>
            </div>

            {/* Infos prestataire uniquement */}
            {selectedUser.role === 'prestataire' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Informations professionnelles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">SIRET</span>
                    <span className="font-medium">{selectedUser.siret || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Zone d'intervention</span>
                    <span className="font-medium">{selectedUser.zone_intervention || 'Non définie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Note moyenne</span>
                    <span className="font-medium">
                      {selectedUser.rating ? `⭐ ${selectedUser.rating} / 5` : 'Pas encore noté'}
                    </span>
                  </div>
                  {selectedUser.rejection_reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Motif rejet</span>
                      <span className="font-medium text-red-600">{selectedUser.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer modal */}
          <div className="p-6 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
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
          <button onClick={() => setActiveSection('users')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'users' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Utilisateurs ({clients.length + providers.length})
          </button>
          <button onClick={() => setActiveSection('gallery')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'gallery' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Galerie photos ({allPhotos.length})
          </button>
          <button onClick={() => setActiveSection('finances')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'finances' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Finances
          </button>
          <button onClick={() => setActiveSection('cemeteries')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'cemeteries' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Cimetières ({cemeteries.length})
          </button>
          <button onClick={() => setActiveSection('services')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'services' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Services ({services.length})
          </button>
          <button onClick={() => setActiveSection('history')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'history' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Historique ({allOrders.length})
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
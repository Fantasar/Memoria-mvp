// frontend/src/pages/dashboards/DashboardAdmin.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from '../../components/layout/Header';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [pendingProviders, setPendingProviders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [disputedOrders, setDisputedOrders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPhotos, setOrderPhotos] = useState({});
  const [showDisputeModal, setShowDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    fetchPendingProviders();
    fetchPendingOrders();
    fetchDisputedOrders();
  }, []);

  const fetchPendingProviders = async () => {
    try {
      setLoadingProviders(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/providers/pending',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPendingProviders(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement prestataires:', err);
      setError('Impossible de charger les prestataires en attente');
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleApprove = async (providerId) => {
    const confirm = window.confirm(
      'Êtes-vous sûr de vouloir valider ce prestataire ? Il pourra alors accepter des missions.'
    );
    
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/providers/${providerId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Prestataire validé avec succès !');
      fetchPendingProviders();
      
    } catch (err) {
      console.error('Erreur validation:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const handleReject = async (providerId) => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      alert('Le motif doit contenir au moins 10 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/providers/${providerId}/reject`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Prestataire rejeté');
      setShowRejectModal(null);
      setRejectReason('');
      fetchPendingProviders();
      
    } catch (err) {
      console.error('Erreur rejet:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors du rejet');
    }
  };

  const fetchPendingOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/orders/pending-validation',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPendingOrders(response.data.data);
      
      // Charger les photos pour chaque commande
      response.data.data.forEach(order => {
        fetchOrderPhotos(order.id);
      });
      
    } catch (err) {
      console.error('Erreur chargement interventions:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // ✅ NOUVEAU : Récupérer les photos d'une commande
  const fetchOrderPhotos = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5500/api/photos/order/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrderPhotos(prev => ({
        ...prev,
        [orderId]: response.data.data
      }));
      
    } catch (err) {
      console.error('Erreur chargement photos:', err);
    }
  };

  // ✅ NOUVEAU : Valider une intervention
  const handleValidateOrder = async (orderId) => {
    const confirm = window.confirm(
      'Êtes-vous sûr de vouloir valider cette intervention ? Le paiement sera débloqué au prestataire.'
    );
    
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/orders/${orderId}/validate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Intervention validée et paiement débloqué !');
      fetchPendingOrders();
      
    } catch (err) {
      console.error('Erreur validation:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  // ✅ NOUVEAU : Toggle affichage photos
  const togglePhotos = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const fetchDisputedOrders = async () => {
    try {
      setLoadingDisputes(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/orders/disputed',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDisputedOrders(response.data.data);
      
      // Charger les photos pour chaque commande
      response.data.data.forEach(order => {
        fetchOrderPhotos(order.id);
      });
      
    } catch (err) {
      console.error('Erreur chargement litiges:', err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  // ✅ NOUVEAU : Marquer comme litigieux
  const handleMarkAsDisputed = async (orderId) => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      alert('Le motif doit contenir au moins 10 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/orders/${orderId}/dispute`,
        { reason: disputeReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Commande marquée comme litigieuse');
      setShowDisputeModal(null);
      setDisputeReason('');
      fetchPendingOrders();
      fetchDisputedOrders();
      
    } catch (err) {
      console.error('Erreur marquage litige:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors du marquage');
    }
  };

  // ✅ NOUVEAU : Résoudre un litige
  const handleResolveDispute = async (orderId, action) => {
    const messages = {
      validate: 'Êtes-vous sûr de vouloir VALIDER cette intervention malgré le litige ? Le prestataire sera payé.',
      refund: 'Êtes-vous sûr de vouloir REMBOURSER le client ? La commande sera annulée.',
      request_correction: 'Êtes-vous sûr de demander une CORRECTION au prestataire ? Il devra re-uploader les photos.'
    };

    const confirm = window.confirm(messages[action]);
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/orders/${orderId}/resolve`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Litige résolu avec succès !');
      fetchDisputedOrders();
      
    } catch (err) {
      console.error('Erreur résolution:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors de la résolution');
    }
  };

  if (loadingProviders || loadingOrders || loadingDisputes) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Administrateur
            </h1>
            <p className="mt-2 text-gray-600">
              Bienvenue {user?.prenom} {user?.nom}
            </p>
          </div>

          {/* ✅ SECTION : Litiges */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Litiges en cours
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {disputedOrders.length} litige{disputedOrders.length > 1 ? 's' : ''}
              </span>
            </div>

            {disputedOrders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Aucun litige en cours
                </h3>
                <p className="mt-1 text-gray-500">
                  Tous les litiges ont été résolus
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map(order => {
                  const photos = orderPhotos[order.id] || [];
                  const beforePhoto = photos.find(p => p.type === 'before');
                  const afterPhoto = photos.find(p => p.type === 'after');

                  return (
                    <div key={order.id} className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order.cemetery_name}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
                              🚨 Litige
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Client</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.client_prenom} {order.client_nom}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Prestataire</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.prestataire_prenom} {order.prestataire_nom}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Service</p>
                              <p className="text-sm font-medium text-gray-900">{order.service_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Montant</p>
                              <p className="text-sm font-medium text-gray-900">{order.price} €</p>
                            </div>
                          </div>

                          <div className="mb-4 p-3 bg-white rounded border border-red-200">
                            <p className="text-sm font-medium text-red-900 mb-1">Motif du litige :</p>
                            <p className="text-sm text-gray-700">{order.dispute_reason}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {beforePhoto && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">📸 Avant</p>
                                <img 
                                  src={beforePhoto.url} 
                                  alt="Avant" 
                                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                                />
                              </div>
                            )}
                            {afterPhoto && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">✨ Après</p>
                                <img 
                                  src={afterPhoto.url} 
                                  alt="Après" 
                                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => handleResolveDispute(order.id, 'validate')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                              ✓ Valider quand même
                            </button>
                            <button
                              onClick={() => handleResolveDispute(order.id, 'request_correction')}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                              🔄 Demander correction
                            </button>
                            <button
                              onClick={() => handleResolveDispute(order.id, 'refund')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                              💸 Rembourser client
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Interventions à valider */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Interventions à valider
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {pendingOrders.length} en attente
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Aucune intervention en attente
                </h3>
                <p className="mt-1 text-gray-500">
                  Toutes les interventions ont été validées
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map(order => {
                  const photos = orderPhotos[order.id] || [];
                  const beforePhoto = photos.find(p => p.type === 'before');
                  const afterPhoto = photos.find(p => p.type === 'after');

                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order.cemetery_name}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              En attente validation
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Client</p>
                              <p className="text-sm font-medium text-gray-900">{order.client_email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Prestataire</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.prestataire_prenom} {order.prestataire_nom}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Service</p>
                              <p className="text-sm font-medium text-gray-900">{order.service_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Montant</p>
                              <p className="text-sm font-medium text-gray-900">{order.price} €</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Lieu</p>
                              <p className="text-sm font-medium text-gray-900">{order.cemetery_city}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Terminée le</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(order.updated_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => togglePhotos(order.id)}
                            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            {selectedOrder === order.id ? '▼ Masquer les photos' : '▶ Voir les photos avant/après'}
                          </button>

                          {selectedOrder === order.id && (
                            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                              {beforePhoto ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">📸 Avant</p>
                                  <img 
                                    src={beforePhoto.url} 
                                    alt="Avant intervention" 
                                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                                  <p className="text-gray-500">Photo avant manquante</p>
                                </div>
                              )}
                              
                              {afterPhoto ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">✨ Après</p>
                                  <img 
                                    src={afterPhoto.url} 
                                    alt="Après intervention" 
                                    className="w-full h-64 object-cover rounded-lg border-2 border-green-200"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                                  <p className="text-gray-500">Photo après manquante</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleValidateOrder(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                              ✓ Valider l'intervention ({(parseFloat(order.price) * 0.80).toFixed(2)}€ → prestataire)
                            </button>
                            
                            <button
                              onClick={() => setShowDisputeModal(order.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                              🚨 Marquer comme litigieux
                            </button>
                          </div>

                          {showDisputeModal === order.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold mb-4">Marquer comme litigieux</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Indiquez le motif du litige (minimum 10 caractères)
                                </p>
                                <textarea
                                  value={disputeReason}
                                  onChange={(e) => setDisputeReason(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                                  rows="4"
                                  placeholder="Ex: Photos de mauvaise qualité, travail non conforme, client mécontent..."
                                />
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setShowDisputeModal(null);
                                      setDisputeReason('');
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsDisputed(order.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                  >
                                    Confirmer
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Validation Prestataires */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Prestataires en attente de validation
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                {pendingProviders.length} en attente
              </span>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {pendingProviders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Aucun prestataire en attente
                </h3>
                <p className="mt-1 text-gray-500">
                  Tous les prestataires ont été validés ou rejetés
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProviders.map(provider => (
                  <div key={provider.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {provider.prenom} {provider.nom}
                          </h3>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{provider.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="text-sm font-medium text-gray-900">{provider.phone || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">SIRET</p>
                            <p className="text-sm font-medium text-gray-900">{provider.siret || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Zone d'intervention</p>
                            <p className="text-sm font-medium text-gray-900">{provider.zone_intervention || 'Non définie'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Adresse</p>
                            <p className="text-sm font-medium text-gray-900">{provider.address || 'Non renseignée'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Inscrit le</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(provider.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(provider.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ✓ Valider
                          </button>
                          <button
                            onClick={() => setShowRejectModal(provider.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ✗ Rejeter
                          </button>
                        </div>
                      </div>
                    </div>

                    {showRejectModal === provider.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">Rejeter le prestataire</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Veuillez indiquer le motif du rejet (minimum 10 caractères)
                          </p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                            rows="4"
                            placeholder="Ex: Documents incomplets, SIRET invalide, zone non couverte..."
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setShowRejectModal(null);
                                setRejectReason('');
                              }}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleReject(provider.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                              Confirmer le rejet
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Commandes</h3>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Prestataires Actifs</h3>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Clients</h3>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;
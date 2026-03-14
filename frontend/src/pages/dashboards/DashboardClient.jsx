// frontend/src/pages/dashboards/DashboardClient.jsx
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import OrderListPreview from '../../components/orders/OrderListPreview';
import OrderListFull from '../../components/orders/OrderListFull';
import CrispChat from '../../components/layout/CrispChat';
import PhotoGallery from '../../components/client/PhotoGallery';
import CurrentMission from '../../components/client/CurrentMission';
import ClientNotifications from '../../components/client/ClientNotifications';
import Navbar from '../../components/layout/Navbar';

/** Génère les headers d'authentification JWT depuis le localStorage */
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const NAV_SECTIONS = [
  { key: 'overview',       label: 'Aperçu' },
  { key: 'currentMission', label: 'Mission en cours' },
  { key: 'orders',         label: 'Historique des commandes' },
  { key: 'gallery',        label: 'Galerie photos' },
  { key: 'notifications',  label: 'Notifications' },
  { key: 'profile',        label: 'Profil' },
];

const ICONS = {
  overview: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  currentMission: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  orders: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  gallery: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  notifications: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

function DashboardClient() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [dashboardStats, setDashboardStats] = useState({
    orders_in_progress: 0,
    orders_completed: 0,
    last_order_date: null
  });

  // Modal évaluation
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Modal profil
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({ prenom: '', nom: '', email: '', telephone: '' });
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  useEffect(() => {
    fetchStats();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/dashboard-stats', authHeaders());
      setDashboardStats(response.data.data || response.data);
    } catch { }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications', authHeaders());
      const notifications = response.data.data?.notifications || [];
      setUnreadCount(notifications.filter(n => !n.is_read).length);
    } catch { }
  };

  const openReviewModal = (order) => {
    setOrderToReview(order);
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setOrderToReview(null);
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await axios.post('/api/reviews', {
        order_id: orderToReview.id,
        rating: reviewRating,
        comment: reviewComment.trim() || null
      }, authHeaders());
      closeReviewModal();
      await fetchStats();
    } catch (err) {
      const code = err.response?.data?.error?.code;
      const message = err.response?.data?.error?.message;
      setReviewError(
        code === 'ALREADY_REVIEWED'
          ? 'Vous avez déjà évalué cette mission'
          : message || "Erreur lors de l'évaluation"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ─── Rendu des sections ───────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {

      case 'overview':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Aperçu</h2>

            {/* KPI cards — dégradé bleu uniforme, max blue-500 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-gray-500 mb-2">Commandes en cours</p>
                <p className="text-3xl font-bold text-blue-500">{dashboardStats.orders_in_progress}</p>
              </div>
              <div className="bg-blue-100 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-gray-500 mb-2">Commandes terminées</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardStats.orders_completed}</p>
              </div>
              <div className="bg-blue-500 border border-blue-500 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-blue-100 mb-2">Dernière commande</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardStats.last_order_date
                    ? new Date(dashboardStats.last_order_date).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {/* Commandes récentes */}
            <OrderListPreview
              onReview={openReviewModal}
              onNavigateToOrders={() => setActiveSection('orders')}
            />
          </div>
        );

      case 'currentMission':
        return <CurrentMission />;

      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Historique des commandes</h2>
            <OrderListFull onReview={openReviewModal} />
          </div>
        );

      case 'gallery':
        return <PhotoGallery />;

      case 'notifications':
        return <ClientNotifications onNotificationRead={fetchUnreadCount} />;

      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mon profil</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-500">Prénom</label><p className="text-gray-900 font-medium">{user?.prenom || '-'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Nom</label><p className="text-gray-900 font-medium">{user?.nom || '-'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Email</label><p className="text-gray-900 font-medium">{user?.email || '-'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Téléphone</label><p className="text-gray-900 font-medium">{user?.telephone || '-'}</p></div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Actif</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Membre depuis</label>
                  <p className="text-gray-900 font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setProfileData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '' });
                  setProfileError(null); setProfileSuccess(null); setShowEditProfile(true);
                }}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-sm transition">
                Modifier mes informations
              </button>
              <button
                onClick={() => {
                  setPasswordData({ current: '', newPassword: '', confirm: '' });
                  setPasswordError(null); setPasswordSuccess(null); setShowChangePassword(true);
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                Changer mon mot de passe
              </button>
            </div>

            {/* Modal modifier profil */}
            {showEditProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Modifier mes informations</h3>
                  {profileError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{profileError}</p></div>}
                  {profileSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{profileSuccess}</p></div>}
                  <div className="space-y-4">
                    {[
                      { field: 'prenom', label: 'Prénom', type: 'text' },
                      { field: 'nom', label: 'Nom', type: 'text' },
                      { field: 'email', label: 'Email', type: 'email' },
                      { field: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '0612345678' },
                    ].map(({ field, label, type, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type={type}
                          value={profileData[field]}
                          onChange={e => setProfileData(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={placeholder || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowEditProfile(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition">
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        setProfileError(null);
                        if (!profileData.prenom.trim() || !profileData.nom.trim() || !profileData.email.trim() || !profileData.telephone.trim()) {
                          setProfileError('Tous les champs sont obligatoires');
                          return;
                        }
                        try {
                          const res = await axios.put('/api/users/profile', profileData, authHeaders());
                          if (res.data.success) {
                            login({ ...user, ...profileData }, localStorage.getItem('token'));
                            setProfileSuccess('Profil mis à jour avec succès');
                            setTimeout(() => setShowEditProfile(false), 1500);
                          }
                        } catch (err) {
                          setProfileError(err.response?.data?.error?.message || 'Erreur lors de la mise à jour');
                        }
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal changer mot de passe */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Changer mon mot de passe</h3>
                  {passwordError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{passwordError}</p></div>}
                  {passwordSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{passwordSuccess}</p></div>}
                  <div className="space-y-4">
                    {[
                      { field: 'current', label: 'Mot de passe actuel' },
                      { field: 'newPassword', label: 'Nouveau mot de passe' },
                      { field: 'confirm', label: 'Confirmer le nouveau mot de passe' },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type="password"
                          value={passwordData[field]}
                          onChange={e => setPasswordData(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowChangePassword(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition">
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        setPasswordError(null);
                        if (!passwordData.current || !passwordData.newPassword || !passwordData.confirm) {
                          setPasswordError('Tous les champs sont obligatoires'); return;
                        }
                        if (passwordData.newPassword.length < 8) {
                          setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères'); return;
                        }
                        if (passwordData.newPassword !== passwordData.confirm) {
                          setPasswordError('Les mots de passe ne correspondent pas'); return;
                        }
                        try {
                          const res = await axios.put('/api/users/password', {
                            currentPassword: passwordData.current,
                            newPassword: passwordData.newPassword,
                          }, authHeaders());
                          if (res.data.success) {
                            setPasswordSuccess('Mot de passe modifié avec succès');
                            setTimeout(() => setShowChangePassword(false), 1500);
                          }
                        } catch (err) {
                          setPasswordError(err.response?.data?.error?.message || 'Erreur lors du changement');
                        }
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition">
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Rendu principal ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-8 pt-32 pl-24 w-full">

        {/* Sidebar iconique fixe */}
        <aside className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col items-center pt-28 pb-6 gap-1">
          {NAV_SECTIONS.map(({ key, label }) => (
            <div key={key} className="relative group w-full flex justify-center">
              <button
                onClick={() => setActiveSection(key)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                  activeSection === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-400 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                {ICONS[key]}
                {key === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5
                bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg
                whitespace-nowrap pointer-events-none
                opacity-0 group-hover:opacity-100
                translate-x-1 group-hover:translate-x-0
                transition-all duration-200 z-50">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
              </div>
            </div>
          ))}
        </aside>

        {/* Zone de contenu */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Client</h1>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Bienvenue <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/orders/new')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition hover:shadow-md">
              + Nouvelle commande
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {renderSection()}
        </section>

      </main>

      {/* Modal évaluation */}
      {showReviewModal && orderToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Évaluer cette mission</h3>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Mission</p>
              <p className="font-semibold text-gray-800">{orderToReview.service_name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {orderToReview.cemetery_name} — {orderToReview.cemetery_city}
              </p>
            </div>

            {reviewError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{reviewError}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Votre note *</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24"
                      fill={star <= reviewRating ? '#F59E0B' : 'none'}
                      stroke={star <= reviewRating ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'][reviewRating]}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce prestataire..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows="4"
                maxLength="500"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{reviewComment.length}/500 caractères</p>
            </div>

            <div className="flex gap-3">
              <button onClick={closeReviewModal} disabled={submittingReview}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmitReview} disabled={submittingReview || !reviewRating}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submittingReview ? 'Envoi...' : "Envoyer l'évaluation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CrispChat user={user} />
    </div>
  );
}

export default DashboardClient;
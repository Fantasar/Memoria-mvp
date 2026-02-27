// frontend/src/pages/dashboards/DashboardClient.jsx
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Composants orders
import OrderListPreview from '../../components/orders/OrderListPreview';
import OrderListFull from '../../components/orders/OrderListFull';

// Composants clients — dossier "clients" avec s
import PhotoGallery from '../../components/client/PhotoGallery';
import CurrentMission from '../../components/client/CurrentMission';
import ClientNotifications from '../../components/client/ClientNotifications';
import Navbar from '../../components/layout/Navbar';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Sections de la sidebar — extraites pour éviter de les redéclarer à chaque render
const NAV_SECTIONS = [
  { key: 'overview', icon: '📊', label: 'Aperçu' },
  { key: 'currentMission', icon: '🔄', label: 'Mission en cours' },
  { key: 'orders', icon: '📋', label: 'Historique des commandes' },
  { key: 'gallery', icon: '📷', label: 'Galerie photos' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
  { key: 'profile', icon: '👤', label: 'Profil' },
];

/**
 * Dashboard principal du client.
 * Navigation par sections via sidebar — contenu rendu dynamiquement.
 */
function DashboardClient() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

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

  //Modal des modification des information du compte
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({ prenom: '', nom: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Message de succès depuis la redirection post-paiement
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  // Chargement initial des stats et du badge notifications
  useEffect(() => {
    fetchStats();
    fetchUnreadCount();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/dashboard-stats', authHeaders());
      setDashboardStats(response.data.data || response.data);
    } catch {
      // Échec silencieux — les stats restent à 0
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications', authHeaders());
      const notifications = response.data.data?.notifications || [];
      setUnreadCount(notifications.filter(n => !n.is_read).length);
    } catch {
      // Échec silencieux — badge reste à 0
    }
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
            <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
                <p className="text-gray-500">Commandes en cours</p>
                <p className="text-2xl font-bold">{dashboardStats.orders_in_progress}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow text-center">
                <p className="text-gray-500">Commandes terminées</p>
                <p className="text-2xl font-bold">{dashboardStats.orders_completed}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
                <p className="text-gray-500">Dernière commande</p>
                <p className="text-2xl font-bold">
                  {dashboardStats.last_order_date
                    ? new Date(dashboardStats.last_order_date).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })
                    : '-'}
                </p>
              </div>
            </div>
            <OrderListPreview onReview={openReviewModal} />
          </div>
        );

      case 'currentMission':
        return <CurrentMission />;

      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Historique des commandes</h2>
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
            <h2 className="text-2xl font-semibold mb-6">Mon profil</h2>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-500">Prénom</label><p className="text-gray-900 font-medium">{user?.prenom || '-'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Nom</label><p className="text-gray-900 font-medium">{user?.nom || '-'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Email</label><p className="text-gray-900 font-medium">{user?.email || '-'}</p></div>
                {/* Téléphone — ajouté pour reset mot de passe et contact prestataire */}
                <div><label className="text-sm font-medium text-gray-500">Téléphone</label><p className="text-gray-900 font-medium">{user?.telephone || '-'}</p></div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Actif</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Membre depuis</label>
                  <p className="text-gray-900 font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setProfileData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '' });
                  setProfileError(null); setProfileSuccess(null); setShowEditProfile(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Modifier mes informations
              </button>
              <button
                onClick={() => {
                  setPasswordData({ current: '', newPassword: '', confirm: '' });
                  setPasswordError(null); setPasswordSuccess(null); setShowChangePassword(true);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                Changer mon mot de passe
              </button>
            </div>

            {/* Modal modifier profil */}
            {showEditProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Modifier mes informations</h3>
                  {profileError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{profileError}</p></div>}
                  {profileSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{profileSuccess}</p></div>}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input type="text" value={profileData.prenom} onChange={e => setProfileData(prev => ({ ...prev, prenom: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input type="text" value={profileData.nom} onChange={e => setProfileData(prev => ({ ...prev, nom: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={profileData.email} onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input type="tel" value={profileData.telephone} onChange={e => setProfileData(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="0612345678" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowEditProfile(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">Annuler</button>
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Modal changer mot de passe ───────────────────────── */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Changer mon mot de passe</h3>

                  {passwordError && (
                    <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{passwordError}</p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">{passwordSuccess}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={e => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        value={passwordData.confirm}
                        onChange={e => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        setPasswordError(null);
                        if (!passwordData.current || !passwordData.newPassword || !passwordData.confirm) {
                          setPasswordError('Tous les champs sont obligatoires');
                          return;
                        }
                        if (passwordData.newPassword.length < 8) {
                          setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
                          return;
                        }
                        if (passwordData.newPassword !== passwordData.confirm) {
                          setPasswordError('Les mots de passe ne correspondent pas');
                          return;
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      {/* Contenu principal */}
      <main className="flex-1 flex bg-blue-50 gap-6 px-6 py-8 pt-32 w-full">

        {/* Sidebar */}
        <aside className="w-1/3 bg-white border-l-4 border-blue-600 rounded-lg p-6 space-y-2 shadow h-fit">
          <p className="text-gray-500 uppercase font-semibold text-sm mb-4">Sections</p>

          {NAV_SECTIONS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === key
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center justify-between">
                <span>{icon} {label}</span>
                {key === 'notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </aside>

        {/* Zone principale */}
        <section className="flex-1 bg-white border-r-4 border-blue-600 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Dashboard Client</h1>
            <button
              onClick={() => navigate('/orders/new')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Nouvelle commande
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">✅ {successMessage}</p>
            </div>
          )}

          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-700">
                Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span>
              </p>
            </div>
          )}

          {renderSection()}
        </section>

      </main>

      {/* Modal évaluation */}
      {showReviewModal && orderToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Évaluer cette mission</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mission</p>
              <p className="font-medium">{orderToReview.service_name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {orderToReview.cemetery_name} — {orderToReview.cemetery_city}
              </p>
            </div>

            {/* Erreur évaluation */}
            {reviewError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{reviewError}</p>
              </div>
            )}

            {/* Sélection étoiles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Votre note *</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-5xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    {star <= reviewRating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {['', '😞 Décevant', '😐 Moyen', '🙂 Bien', '😊 Très bien', '⭐ Excellent'][reviewRating]}
              </p>
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire (optionnel)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce prestataire..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {reviewComment.length}/500 caractères
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeReviewModal}
                disabled={submittingReview}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewRating}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Envoi...' : "✅ Envoyer l'évaluation"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardClient;
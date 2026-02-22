import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import OrderListPreview from '../../components/orders/OrderListPreview';
import OrderListFull from '../../components/orders/OrderListFull';
import axios from 'axios';
import PhotoGallery from '../../components/client/PhotoGallery';

function DashboardClient() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  // Stats dynamiques
  const [dashboardStats, setDashboardStats] = useState({
    orders_in_progress: 0,
    orders_completed: 0,
    last_order_date: null,
  });

  // ✅ STATES POUR LES ÉVALUATIONS
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Afficher message de succès si redirection depuis NewOrder
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.message) {
      setSuccessMessage(state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);

  // Récupérer les stats depuis le backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/orders/dashboard-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des stats');
        const data = await response.json();
        setDashboardStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  // ✅ FONCTION POUR SOUMETTRE L'ÉVALUATION
  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reviews', {
        order_id: orderToReview.id,
        rating: reviewRating,
        comment: reviewComment.trim() || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Merci pour votre évaluation ! 🌟');
      setShowReviewModal(false);
      setOrderToReview(null);
      setReviewRating(5);
      setReviewComment('');
      
      // Recharger les stats pour mettre à jour l'affichage
      const response = await fetch('/api/orders/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error('Erreur évaluation:', err);
      if (err.response?.data?.error?.code === 'ALREADY_REVIEWED') {
        alert('Vous avez déjà évalué cette mission');
      } else {
        alert(err.response?.data?.error?.message || 'Erreur lors de l\'évaluation');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // ✅ FONCTION POUR OUVRIR LE MODAL D'ÉVALUATION
  const openReviewModal = (order) => {
    setOrderToReview(order);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  // Composants des sections du dashboard
  const sections = {
    overview: (
      <div>
        <h2 className="text-xl font-semibold mb-4">Aperçu</h2>

        {/* Statistiques rapides */}
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
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>
        </div>

        {/* Aperçu des commandes */}
        <OrderListPreview onReview={openReviewModal} />
      </div>
    ),

    orders: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Historique des commandes</h2>
        <OrderListFull onReview={openReviewModal} />
      </div>
    ),
    gallery: (
      <div>
        <PhotoGallery />
      </div>
    ),
    profile: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Mon profil</h2>

        {/* Carte informations personnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="text-gray-900 font-medium">{user?.prenom || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-gray-900 font-medium">{user?.nom || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 font-medium">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-gray-900 font-medium">{user?.telephone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        {/* Carte adresse */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Adresse
          </h3>
          
          <div className="space-y-2">
            <p className="text-gray-900">{user?.adresse || 'Non renseignée'}</p>
            <p className="text-gray-900">
              {user?.code_postal && user?.ville 
                ? `${user.code_postal} ${user.ville}` 
                : 'Ville non renseignée'}
            </p>
          </div>
        </div>

        {/* Carte compte */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Informations du compte
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Rôle</label>
              <p className="text-gray-900 font-medium capitalize">{user?.role || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Statut</label>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Actif
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Membre depuis</label>
              <p className="text-gray-900 font-medium">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Modifier mes informations
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
            Changer mon mot de passe
          </button>
        </div>
      </div>
    ),
  };

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
      <main className="flex-1 flex bg-blue-50 gap-6 px-6 py-8 pt-32 w-full">

        {/* Sidebar gauche */}
        <aside className="w-1/3 bg-white border-l-4 border-blue-600 rounded-lg p-6 space-y-4 shadow h-fit">
          <p className="text-gray-500 uppercase font-semibold text-sm mb-4">Sections</p>
          <button onClick={() => setActiveSection('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'overview' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>Aperçu</button>
            <button onClick={() => setActiveSection('gallery')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'gallery' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>Galerie photos</button>
          <button onClick={() => setActiveSection('orders')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'orders' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>Historique des commandes</button>
          <button onClick={() => setActiveSection('profile')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'profile' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>Profil</button>
        </aside>

        {/* Contenu principal */}
        <section className="flex-1 bg-white border-r-4 border-blue-600 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Dashboard Client</h1>
            <button onClick={() => navigate('/orders/new')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">+ Nouvelle commande</button>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">✅ {successMessage}</p>
            </div>
          )}

          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>
            </div>
          )}

          {/* Contenu dynamique selon section */}
          {sections[activeSection]}
        </section>

      </main>

      {/* ✅ MODAL D'ÉVALUATION */}
      {showReviewModal && orderToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Évaluer cette mission</h3>
            
            {/* Infos commande */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mission</p>
              <p className="font-medium">{orderToReview.service_name}</p>
              <p className="text-sm text-gray-600 mt-2">
                {orderToReview.cemetery_name} - {orderToReview.cemetery_city}
              </p>
            </div>

            {/* Sélection étoiles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Votre note *
              </label>
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
                {reviewRating === 5 && '⭐ Excellent'}
                {reviewRating === 4 && '😊 Très bien'}
                {reviewRating === 3 && '🙂 Bien'}
                {reviewRating === 2 && '😐 Moyen'}
                {reviewRating === 1 && '😞 Décevant'}
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
              ></textarea>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {reviewComment.length}/500 caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setOrderToReview(null);
                  setReviewRating(5);
                  setReviewComment('');
                }}
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
                {submittingReview ? 'Envoi...' : '✅ Envoyer l\'évaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardClient;
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardPrestataire() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // States pour les données
  const [stats, setStats] = useState(null);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [myMissions, setMyMissions] = useState([]);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(true);

  // Charger les données au montage
  useEffect(() => {
    fetchStats();
    fetchAvailableMissions();
    fetchMyMissions();
  }, []);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stats/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAvailableMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableMissions(response.data.data || []);
    } catch (err) {
      console.error('Erreur missions disponibles:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchMyMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMissions(response.data.data || []);
    } catch (err) {
      console.error('Erreur mes missions:', err);
    } finally {
      setLoadingMissions(false);
    }
  };

  // ============================================
  // ACTIONS HANDLERS
  // ============================================

  const handleAcceptMission = async (missionId) => {
    if (!window.confirm('Accepter cette mission ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${missionId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mission acceptée !');
      fetchAvailableMissions();
      fetchMyMissions();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleCompleteMission = async (missionId) => {
    if (!window.confirm('Marquer cette mission comme terminée ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${missionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mission terminée ! En attente de validation.');
      fetchMyMissions();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  // ============================================
  // SECTIONS CONTENT
  // ============================================

  const sections = {
    overview: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Aperçu de mon activité</h2>

        {loadingStats ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total gagné</h3>
                <p className="text-4xl font-bold mb-2">{stats.revenue.total_earned.toFixed(2)}€</p>
                <div className="text-sm opacity-90">
                  <p>{stats.revenue.paid_missions} paiements reçus</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Missions complétées</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.by_status.completed || 0}</p>
                <div className="text-sm opacity-90">
                  <p>Taux: {stats.missions.completion_rate}%</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">En cours</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.by_status.accepted || 0}</p>
                <div className="text-sm opacity-90">
                  <p>À terminer</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total missions</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.total}</p>
                <div className="text-sm opacity-90">
                  <p>Depuis le début</p>
                </div>
              </div>
            </div>

            {/* Évolution mensuelle */}
            {stats.monthly?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">📈 Évolution sur 6 mois</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {stats.monthly.map((month, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">{month.month}</p>
                      <p className="text-xl font-bold text-gray-900 mb-1">{month.count}</p>
                      <p className="text-xs text-gray-600 mb-2">missions</p>
                      <p className="text-sm font-semibold text-green-600">{month.revenue.toFixed(0)}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missions récentes */}
            {stats.recent_missions?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🕐 Missions récentes</h3>
                <div className="space-y-3">
                  {stats.recent_missions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/orders/${mission.id}`)}>
                      <div>
                        <p className="font-medium text-gray-900">{mission.cemetery_name}</p>
                        <p className="text-sm text-gray-600">{mission.cemetery_city} • {mission.service_name}</p>
                        <p className="text-xs text-gray-500">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{mission.price}€</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                          mission.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                          mission.status === 'awaiting_validation' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mission.status === 'completed' && '✅ Terminée'}
                          {mission.status === 'accepted' && '🔄 En cours'}
                          {mission.status === 'awaiting_validation' && '⏰ En validation'}
                        </span>
                      </div>
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

    available: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Missions disponibles</h2>

        {loadingAvailable ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : availableMissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune mission disponible dans votre zone</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableMissions.map(mission => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{mission.cemetery_name}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{mission.cemetery_city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{mission.service_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rémunération</p>
                    <p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Créée le</p>
                    <p className="font-medium">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <button onClick={() => handleAcceptMission(mission.id)} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
                  ✓ Accepter cette mission
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    missions: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Mes missions</h2>

        {loadingMissions ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : myMissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Vous n'avez pas encore de missions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myMissions.map(mission => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/orders/${mission.id}`)}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{mission.cemetery_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mission.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    mission.status === 'awaiting_validation' ? 'bg-orange-100 text-orange-800' :
                    mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mission.status === 'accepted' && '🔄 En cours'}
                    {mission.status === 'in_progress' && '🔄 En cours'}
                    {mission.status === 'awaiting_validation' && '⏰ En validation'}
                    {mission.status === 'completed' && '✅ Terminée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{mission.cemetery_city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{mission.service_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rémunération</p>
                    <p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Acceptée le</p>
                    <p className="font-medium">{new Date(mission.accepted_at || mission.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {mission.status === 'accepted' && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate(`/missions/${mission.id}/complete`); 
                    }} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
                  >
                    📸 Terminer et uploader les photos
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    profile: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Mon profil</h2>

        {/* Carte informations personnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Carte informations professionnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Informations professionnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">SIRET</label>
              <p className="text-gray-900 font-medium">{user?.siret || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Zone d'intervention</label>
              <p className="text-gray-900 font-medium">{user?.zone_intervention || 'Non définie'}</p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            Modifier mes informations
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
            Changer mon mot de passe
          </button>
        </div>
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
      <main className="flex-1 flex bg-green-50 gap-6 px-6 py-8 pt-32 w-full">

        {/* Sidebar */}
        <aside className="w-1/3 bg-white border-l-4 border-green-600 rounded-lg p-6 space-y-4 shadow h-fit">
          <p className="text-gray-500 uppercase font-semibold text-sm mb-4">Sections</p>
          <button onClick={() => setActiveSection('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'overview' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Aperçu
          </button>
          <button onClick={() => setActiveSection('available')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'available' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Missions disponibles ({availableMissions.length})
          </button>
          <button onClick={() => setActiveSection('missions')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'missions' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Mes missions ({myMissions.length})
          </button>
          <button onClick={() => setActiveSection('profile')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === 'profile' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Profil
          </button>
        </aside>

        {/* Contenu */}
        <section className="flex-1 bg-white border-r-4 border-green-600 rounded-lg p-6 shadow">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Dashboard Prestataire</h1>
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

export default DashboardPrestataire;
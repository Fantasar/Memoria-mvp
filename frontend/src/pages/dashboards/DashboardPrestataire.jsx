import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from '../../components/layout/Header';
import { Link } from 'react-router-dom';

const DashboardPrestataire = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/stats/provider',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStats(response.data.data);
      
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              Tableau de bord Prestataire
            </h1>
            <p className="mt-2 text-gray-600">
              Bienvenue {user?.prenom} {user?.nom}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/dashboard/prestataire"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">📋 Missions disponibles</h3>
              <p className="text-sm opacity-90">Voir les nouvelles missions dans votre zone</p>
            </Link>
            <Link
              to="/mes-missions"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">🔄 Mes missions en cours</h3>
              <p className="text-sm opacity-90">
                {stats?.missions.by_status.accepted || 0} mission{(stats?.missions.by_status.accepted || 0) > 1 ? 's' : ''} à compléter
              </p>
            </Link>
          </div>

          {/* Statistiques */}
          {stats && (
            <>
              {/* Cartes KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total gagné */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">Total gagné</h3>
                    <svg className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold mb-2">{stats.revenue.total_earned.toFixed(2)}€</p>
                  <p className="text-sm opacity-90">{stats.revenue.paid_missions} paiements reçus</p>
                </div>

                {/* Missions complétées */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">Missions complétées</h3>
                    <svg className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold mb-2">{stats.missions.by_status.completed || 0}</p>
                  <p className="text-sm opacity-90">Taux de réussite: {stats.missions.completion_rate}%</p>
                </div>

                {/* Missions en cours */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">En cours</h3>
                    <svg className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold mb-2">{stats.missions.by_status.accepted || 0}</p>
                  <p className="text-sm opacity-90">À terminer</p>
                </div>

                {/* Total missions */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">Total missions</h3>
                    <svg className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold mb-2">{stats.missions.total}</p>
                  <p className="text-sm opacity-90">Depuis le début</p>
                </div>
              </div>

              {/* Évolution mensuelle */}
              {stats.monthly.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📈 Évolution sur 6 mois
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {stats.monthly.map((month, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">{month.month}</p>
                        <p className="text-xl font-bold text-gray-900 mb-1">{month.count}</p>
                        <p className="text-xs text-gray-600 mb-2">missions</p>
                        <p className="text-sm font-semibold text-green-600">
                          {month.revenue.toFixed(0)}€
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missions récentes */}
              {stats.recent_missions.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🕐 Missions récentes
                  </h3>
                  <div className="space-y-3">
                    {stats.recent_missions.map((mission) => (
                      <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{mission.cemetery_name}</p>
                          <p className="text-sm text-gray-600">
                            {mission.cemetery_city} • {mission.service_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                          </p>
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
                            {mission.status === 'refunded' && '💸 Remboursée'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPrestataire;
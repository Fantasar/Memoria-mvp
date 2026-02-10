import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from '../../components/layout/Header';

const DashboardPrestataire = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Charger les missions disponibles
  useEffect(() => {
    fetchAvailableMissions();
  }, []);

  const fetchAvailableMissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/orders/available',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMissions(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement missions:', err);
      setError('Impossible de charger les missions disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMission = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/orders/${orderId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Recharger la liste après acceptation
      fetchAvailableMissions();
      
      alert('Mission acceptée avec succès !');
    } catch (err) {
      console.error('Erreur acceptation mission:', err);
      alert('Erreur lors de l\'acceptation de la mission');
    }
  };

  // Filtrer les missions par type
  const filteredMissions = filterType === 'all' 
    ? missions 
    : missions.filter(m => m.service_name === filterType);

  // Liste unique des types de services
  const serviceTypes = ['all', ...new Set(missions.map(m => m.service_name))];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des missions...</p>
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
              Missions disponibles
            </h1>
            <p className="mt-2 text-gray-600">
              Zone d'intervention : <span className="font-medium">{user?.zone_intervention || 'Non définie'}</span>
            </p>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex gap-3">
            {serviceTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {type === 'all' ? 'Tous les services' : type}
              </button>
            ))}
          </div>

          {/* Message erreur */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Liste missions */}
          {filteredMissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Aucune mission disponible
              </h3>
              <p className="mt-1 text-gray-500">
                {filterType === 'all' 
                  ? 'Il n\'y a pas de missions disponibles dans votre zone pour le moment.'
                  : `Aucune mission de type "${filterType}" disponible.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map(mission => (
                <div 
                  key={mission.id} 
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  {/* Type de service */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {mission.service_name}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {mission.base_price} €
                    </span>
                  </div>

                  {/* Informations cimetière */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {mission.cemetery_name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {mission.cemetery_city}, {mission.cemetery_department}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Créée le {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Bouton accepter */}
                  <button
                    onClick={() => handleAcceptMission(mission.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Accepter la mission
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPrestataire;
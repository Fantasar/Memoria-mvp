import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Header from '../components/layout/Header';
import PhotoUpload from '../components/orders/PhotoUpload';

const MesMissions = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);

  useEffect(() => {
    fetchMyMissions();
  }, []);

  const fetchMyMissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5500/api/orders',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Filtrer seulement les missions acceptées
      const acceptedMissions = response.data.data.filter(
        order => order.status === 'accepted'
      );

      setMissions(acceptedMissions);
    } catch (err) {
      console.error('Erreur chargement missions:', err);
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
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Mes missions en cours
            </h1>
            <p className="mt-2 text-gray-600">
              {missions.length} mission{missions.length > 1 ? 's' : ''} à compléter
            </p>
          </div>

          {missions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Aucune mission en cours</p>
            </div>
          ) : (
            <div className="space-y-6">
              {missions.map(mission => (
                <div key={mission.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mission.cemetery_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mission.cemetery_city} • {mission.service_name}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      En cours
                    </span>
                  </div>

                  {selectedMission === mission.id ? (
                    <div className="mt-4">
                      <PhotoUpload 
                        orderId={mission.id}
                        onUploadSuccess={() => {
                          setSelectedMission(null);
                          fetchMyMissions();
                        }}
                      />
                      <button
                        onClick={() => setSelectedMission(null)}
                        className="mt-4 text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedMission(mission.id)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Ajouter les photos
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MesMissions;
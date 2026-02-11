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

  const handleCompleteMission = async (orderId) => {
    const confirm = window.confirm(
      'Êtes-vous sûr d\'avoir uploadé les photos avant ET après ? La mission sera marquée comme terminée et envoyée au client pour validation.'
    );
    
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5500/api/orders/${orderId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Mission terminée avec succès ! En attente de validation client.');
      
      // Recharger la liste
      fetchMyMissions();
      
    } catch (err) {
      console.error('Erreur complétion mission:', err);
      
      const errorMessage = err.response?.data?.error?.message || 
                          'Erreur lors de la complétion de la mission';
      
      alert(errorMessage);
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
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Aucune mission en cours
              </h3>
              <p className="mt-1 text-gray-500">
                Acceptez des missions disponibles pour les voir ici
              </p>
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
                      <p className="text-sm text-gray-500 mt-1">
                        Prix : {mission.base_price || mission.price} €
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
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => setSelectedMission(mission.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Ajouter les photos
                      </button>
                      
                      <button
                        onClick={() => handleCompleteMission(mission.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Terminer la mission
                      </button>
                    </div>
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
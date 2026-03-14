// frontend/src/components/clients/CurrentMission.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import OrderTimeline from './OrderTimeline';

/** Génère les headers d'authentification JWT depuis le localStorage */
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Statuts indiquant qu'une mission est active côté client
const IN_PROGRESS_STATUSES = ['accepted', 'awaiting_validation', 'disputed'];

/**
 * Affiche la ou les missions en cours du client avec timeline et photos avant/après.
 * Les photos sont chargées uniquement pour les missions en awaiting_validation ou disputed.
 */
function CurrentMission() {
  const [currentOrders, setCurrentOrders]   = useState([]);
  const [photosByOrder, setPhotosByOrder]   = useState({});
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    fetchCurrentMission();
  }, []);

  /** Récupère les commandes en cours et leurs photos associées */
  const fetchCurrentMission = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders', authHeaders());
      const orders = response.data.data || [];

      // Filtre uniquement les commandes dont le statut indique une mission active
      const inProgressOrders = orders.filter(o =>
        IN_PROGRESS_STATUSES.includes(o.status)
      );

      setCurrentOrders(inProgressOrders);

      // Charge les photos uniquement pour les missions en attente de validation ou en litige
      const photosMap = {};
      await Promise.all(
        inProgressOrders
          .filter(o => ['awaiting_validation', 'disputed'].includes(o.status))
          .map(async (o) => {
            try {
              const res = await axios.get(`/api/photos/order/${o.id}`, authHeaders());
              photosMap[o.id] = res.data.data || [];
            } catch {
              photosMap[o.id] = [];
            }
          })
      );
      setPhotosByOrder(photosMap);

    } catch {
      // Échec silencieux
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  /** En-tête commun aux deux états (vide et avec mission) */
  const SectionHeader = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Mission en cours</h2>
      <p className="text-sm text-gray-500 mt-1">Suivez l'avancement de votre intervention</p>
    </div>
  );

  if (currentOrders.length === 0) {
    return (
      <div>
        <SectionHeader />
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-xl mb-2"></p>
          <p className="text-gray-600 font-medium">Aucune mission en cours</p>
          <p className="text-sm text-gray-500 mt-2">
            Toutes vos missions sont terminées ou en attente d'attribution
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader />

      {currentOrders.length > 1 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm font-medium">
             {currentOrders.length} missions en cours
          </p>
        </div>
      )}

      <div className="space-y-8">
        {currentOrders.map(order => {
          const photos = photosByOrder[order.id] || [];
          const beforePhoto = photos.find(p => p.type === 'before');
          const afterPhoto = photos.find(p => p.type === 'after');

          return (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">

              {/* Carte récapitulatif */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{order.service_name}</h3>
                    <p className="text-blue-100 mb-1"> {order.cemetery_name}</p>
                    <p className="text-blue-100 text-sm">{order.cemetery_city}</p>

                    {order.scheduled_date && (
                      <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 inline-block">
                        <p className="text-sm opacity-90">Intervention prévue le</p>
                        <p className="font-bold text-lg">
                          {new Date(order.scheduled_date).toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric',
                            month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm mb-1">Montant</p>
                    <p className="text-3xl font-bold">{order.price}€</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 border-b border-gray-200">
                <OrderTimeline order={order} />
              </div>

              {/* Photos */}
              {photos.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold mb-4"> Photos de l'intervention</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {beforePhoto && (
                      <div className="relative group">
                        <img src={beforePhoto.url} alt="Avant"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-end p-4">
                          <span className="bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm font-medium">
                             Avant intervention
                          </span>
                        </div>
                      </div>
                    )}
                    {afterPhoto && (
                      <div className="relative group">
                        <img src={afterPhoto.url} alt="Après"
                          className="w-full h-64 object-cover rounded-lg border-2 border-green-200" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-end p-4">
                          <span className="bg-green-600 bg-opacity-90 text-white px-3 py-2 rounded text-sm font-medium">
                             Après intervention
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {order.status === 'awaiting_validation' && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 font-medium">Validation en cours</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Un administrateur vérifie la qualité de l'intervention.
                      </p>
                    </div>
                  )}

                  {order.status === 'disputed' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium"> Litige en cours d'examen</p>
                      <p className="text-sm text-red-700 mt-1">
                        {order.dispute_reason || 'Votre signalement est en cours de traitement.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Message d'attente */}
              {order.status === 'accepted' && (
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">En attente de l'intervention</h4>
                        <p className="text-sm text-blue-800">
                          Le prestataire effectuera l'intervention à la date prévue.
                          Vous recevrez les photos avant/après une fois le travail terminé.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CurrentMission;
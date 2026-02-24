// frontend/src/components/orders/PhotoGallery.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Affiche les photos avant/après d'une commande spécifique.
 * Composant léger utilisé dans les vues prestataire et admin.
 *
 * @param {string} orderId - UUID de la commande
 */
const PhotoGallery = ({ orderId }) => {
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`/api/photos/order/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPhotos(response.data.data || []);
      } catch {
        // Échec silencieux — affiche l'état vide
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [orderId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Chargement des photos...</p>;
  }

  if (photos.length === 0) {
    return <p className="text-sm text-gray-500">Aucune photo disponible</p>;
  }

  const beforePhoto = photos.find(p => p.type === 'before');
  const afterPhoto  = photos.find(p => p.type === 'after');

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {beforePhoto && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">📷 Avant</p>
          <img
            src={beforePhoto.url}
            alt="Avant intervention"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
      {afterPhoto && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">✨ Après</p>
          <img
            src={afterPhoto.url}
            alt="Après intervention"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
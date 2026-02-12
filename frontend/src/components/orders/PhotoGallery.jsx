import { useState, useEffect } from 'react';
import axios from 'axios';

const PhotoGallery = ({ orderId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [orderId]);

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5500/api/photos/order/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPhotos(response.data.data);
    } catch (err) {
      console.error('Erreur chargement photos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement photos...</p>;

  if (photos.length === 0) return <p className="text-sm text-gray-500">Aucune photo uploadée</p>;

  const beforePhoto = photos.find(p => p.type === 'before');
  const afterPhoto = photos.find(p => p.type === 'after');

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {beforePhoto && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Avant</p>
          <img 
            src={beforePhoto.url} 
            alt="Avant intervention" 
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
      {afterPhoto && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Après</p>
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
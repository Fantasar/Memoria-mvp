import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function CompleteMission() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Photos
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);

  // Charger les détails de la mission
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Mission chargée:', response.data);
        
        // ✅ Adapter selon la structure de réponse
        if (response.data.success) {
          setMission(response.data.data);
        } else {
          setMission(response.data);
        }
        
      } catch (err) {
        console.error('Erreur chargement mission:', err);
        alert('Erreur lors du chargement de la mission');
        navigate('/dashboard/prestataire');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMission();
    }
  }, [id, navigate]);

  // Gérer la sélection de la photo AVANT
  const handleBeforePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeforePhoto(file);
      setBeforePreview(URL.createObjectURL(file));
    }
  };

  // Gérer la sélection de la photo APRÈS
  const handleAfterPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterPhoto(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  // Soumettre les photos et terminer la mission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!beforePhoto || !afterPhoto) {
      alert('Les deux photos (avant et après) sont obligatoires');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');

      console.log('📸 Upload photo AVANT...');
      
      // 1. Upload photo AVANT
      const beforeFormData = new FormData();
      beforeFormData.append('photo', beforePhoto);
      beforeFormData.append('order_id', id);
      beforeFormData.append('photo_type', 'before');

      const beforeResponse = await axios.post('/api/photos/upload', beforeFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Photo avant uploadée:', beforeResponse.data);

      console.log('📸 Upload photo APRÈS...');

      // 2. Upload photo APRÈS
      const afterFormData = new FormData();
      afterFormData.append('photo', afterPhoto);
      afterFormData.append('order_id', id);
      afterFormData.append('photo_type', 'after');

      const afterResponse = await axios.post('/api/photos/upload', afterFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Photo après uploadée:', afterResponse.data);

      console.log('✅ Marquage mission comme terminée...');

      // 3. Marquer la mission comme terminée
      const completeResponse = await axios.patch(`/api/orders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Mission terminée:', completeResponse.data);

      alert('Mission terminée avec succès ! En attente de validation.');
      navigate('/dashboard/prestataire');

    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Response:', err.response?.data);
      alert(err.response?.data?.error?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Mission not found
  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Mission introuvable</p>
          <button 
            onClick={() => navigate('/dashboard/prestataire')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold">M</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-1 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENU */}
      <main className="flex-1 pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate('/dashboard/prestataire')} className="text-green-600 hover:text-green-700 font-medium mb-4 flex items-center gap-2">
              ← Retour au dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terminer la mission</h1>
            <p className="text-gray-600">Uploadez les photos avant/après pour finaliser</p>
          </div>

          {/* Infos mission */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{mission.cemetery_name || 'Cimetière'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{mission.service_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ville</p>
                <p className="font-medium">{mission.cemetery_city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rémunération</p>
                <p className="font-medium text-green-600">{mission.price ? (parseFloat(mission.price) * 0.80).toFixed(2) : '0.00'}€</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">En cours</span>
              </div>
            </div>
          </div>

          {/* Formulaire upload photos */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Photos de l'intervention</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Photo AVANT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Photo AVANT <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {beforePreview ? (
                    <div className="relative">
                      <img src={beforePreview} alt="Avant" className="w-full h-64 object-cover rounded-lg mb-2" />
                      <button type="button" onClick={() => { setBeforePhoto(null); setBeforePreview(null); }} className="text-red-600 text-sm hover:text-red-700">
                        ✗ Supprimer
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner</p>
                      <input type="file" accept="image/*" onChange={handleBeforePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Photo APRÈS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✨ Photo APRÈS <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {afterPreview ? (
                    <div className="relative">
                      <img src={afterPreview} alt="Après" className="w-full h-64 object-cover rounded-lg mb-2" />
                      <button type="button" onClick={() => { setAfterPhoto(null); setAfterPreview(null); }} className="text-red-600 text-sm hover:text-red-700">
                        ✗ Supprimer
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner</p>
                      <input type="file" accept="image/*" onChange={handleAfterPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/dashboard/prestataire')} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition">
                Annuler
              </button>
              <button type="submit" disabled={uploading || !beforePhoto || !afterPhoto} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? 'Upload en cours...' : '✓ Terminer la mission'}
              </button>
            </div>

          </form>

        </div>
      </main>

    </div>
  );
}

export default CompleteMission;
// frontend/src/pages/orders/NewOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_URL from '../../config/api'; // ← IMPORT

function NewOrder() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // États du formulaire
  const [cemeteries, setCemeteries] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    cemetery_id: '',
    service_category_id: '',
    cemetery_location: '',
    price: 0
  });

  // Prix sélectionné
  const [selectedPrice, setSelectedPrice] = useState(0);

  // Validation
  const [errors, setErrors] = useState({});

  // ============ CHARGEMENT DES DONNÉES ============

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer cimetières et services en parallèle
        const [cemeteriesRes, servicesRes] = await Promise.all([
          axios.get(`${API_URL}/api/cemeteries`),           // ← MODIFIÉ
          axios.get(`${API_URL}/api/service-categories`)    // ← MODIFIÉ
        ]);

        setCemeteries(cemeteriesRes.data.data);
        setServiceCategories(servicesRes.data.data);
        setError(null);

      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============ GESTION DES CHANGEMENTS ============

  const handleCemeteryChange = (e) => {
    setFormData({ ...formData, cemetery_id: e.target.value });
    setErrors({ ...errors, cemetery_id: '' });
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = serviceCategories.find(s => s.id === parseInt(serviceId));
    const price = service ? parseFloat(service.base_price) : 0;

    setFormData({ 
      ...formData, 
      service_category_id: serviceId,
      price: price
    });
    setSelectedPrice(price);
    setErrors({ ...errors, service_category_id: '' });
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    // Limitation 255 caractères
    if (value.length <= 255) {
      setFormData({ ...formData, cemetery_location: value });
      setErrors({ ...errors, cemetery_location: '' });
    }
  };

  // ============ VALIDATION ============

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cemetery_id) {
      newErrors.cemetery_id = 'Veuillez sélectionner un cimetière';
    }

    if (!formData.service_category_id) {
      newErrors.service_category_id = 'Veuillez sélectionner un service';
    }

    if (!formData.cemetery_location.trim()) {
      newErrors.cemetery_location = 'Veuillez préciser l\'emplacement de la tombe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ SOUMISSION ============

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/orders`,  // ← MODIFIÉ
        {
          cemetery_id: parseInt(formData.cemetery_id),
          service_category_id: parseInt(formData.service_category_id),
          cemetery_location: formData.cemetery_location.trim(),
          price: formData.price
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Redirection vers le dashboard client avec message de succès
        navigate('/dashboard/client', { 
          state: { message: 'Commande créée avec succès !' }
        });
      }

    } catch (err) {
      console.error('Erreur création commande:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER LOADING ============

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER FORMULAIRE ============

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle commande</h1>
          <p className="text-gray-600 mt-2">Commandez un service d'entretien de sépulture</p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          
          {/* Section 1 : Cimetière */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
            
            {/* Sélection cimetière */}
            <div>
              <label htmlFor="cemetery" className="block text-sm font-medium text-gray-700 mb-2">
                Cimetière <span className="text-red-500">*</span>
              </label>
              <select
                id="cemetery"
                value={formData.cemetery_id}
                onChange={handleCemeteryChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cemetery_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez un cimetière</option>
                {cemeteries.map(cemetery => (
                  <option key={cemetery.id} value={cemetery.id}>
                    {cemetery.name} - {cemetery.city} ({cemetery.department})
                  </option>
                ))}
              </select>
              {errors.cemetery_id && (
                <p className="mt-1 text-sm text-red-600">{errors.cemetery_id}</p>
              )}
            </div>

            {/* Emplacement détaillé */}
            <div className="mt-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Emplacement de la tombe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                value={formData.cemetery_location}
                onChange={handleLocationChange}
                placeholder="Ex: Section A, Allée 3, Tombe Dupont"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cemetery_location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.cemetery_location.length}/255 caractères
              </p>
              {errors.cemetery_location && (
                <p className="mt-1 text-sm text-red-600">{errors.cemetery_location}</p>
              )}
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200"></div>

          {/* Section 2 : Service */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de service</h2>
            
            <div className="space-y-3">
              {serviceCategories.map(service => (
                <label
                  key={service.id}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.service_category_id === String(service.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={formData.service_category_id === String(service.id)}
                    onChange={handleServiceChange}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600 ml-4">
                        {parseFloat(service.base_price).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {errors.service_category_id && (
              <p className="mt-2 text-sm text-red-600">{errors.service_category_id}</p>
            )}
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200"></div>

          {/* Section 3 : Récapitulatif */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix du service</span>
                <span className="font-semibold">{selectedPrice.toFixed(2)} €</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">{selectedPrice.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/client')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Création en cours...' : 'Créer la commande'}
            </button>
          </div>

        </form>

        {/* Info complémentaire */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Bon à savoir :</strong> Votre commande sera visible par les prestataires de votre zone. 
            Le paiement sera effectué une fois le service validé par notre équipe.
          </p>
        </div>

      </div>
    </div>
  );
}

export default NewOrder;
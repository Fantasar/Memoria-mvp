// frontend/src/pages/orders/NewOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import CemeteryMap from '../../components/maps/CemeteryMap';


function NewOrder() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [cemeteries, setCemeteries] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPrice, setSelectedPrice] = useState(0);

  const [formData, setFormData] = useState({
    cemetery_id: '',
    service_category_id: '',
    cemetery_location: '',
    comment: '',
  });

  // ─── Chargement initial ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cemRes, svcRes] = await Promise.all([
          axios.get('/api/cemeteries'),
          axios.get('/api/service-categories'),
        ]);
        setCemeteries(cemRes.data.data || []);
        setServiceCategories(svcRes.data.data || []);
      } catch {
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // Handler générique — efface l'erreur du champ modifié
  const handleField = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Handler service — met aussi à jour selectedPrice
  const handleServiceChange = (e) => {
    const id = e.target.value;
    const service = serviceCategories.find(s => s.id === parseInt(id));
    setFormData(prev => ({ ...prev, service_category_id: id }));
    setSelectedPrice(service ? parseFloat(service.base_price) : 0);
    setErrors(prev => ({ ...prev, service_category_id: '' }));
  };

  // Handler location — avec limite 255 caractères
  const handleLocationChange = (e) => {
    const value = e.target.value;
    if (value.length > 255) return;
    setFormData(prev => ({ ...prev, cemetery_location: value }));
    setErrors(prev => ({ ...prev, cemetery_location: '' }));
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cemetery_id) newErrors.cemetery_id = 'Veuillez sélectionner un cimetière';
    if (!formData.service_category_id) newErrors.service_category_id = 'Veuillez sélectionner un service';
    if (!formData.cemetery_location.trim()) newErrors.cemetery_location = "Veuillez préciser l'emplacement de la tombe";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    navigate('/orders/checkout', {
      state: {
        orderData: {
          cemetery_id: parseInt(formData.cemetery_id),
          service_category_id: parseInt(formData.service_category_id),
          cemetery_location: formData.cemetery_location.trim(),
          comment: formData.comment.trim() || null,
        },
      },
    });
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">

        <div className="mb-8">
          <button onClick={() => navigate('/dashboard/client')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle commande</h1>
          <p className="text-gray-600 mt-2">Commandez un service d'entretien de sépulture</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:underline">
              Réessayer
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">

          {/* ── Section 1 : Localisation ─────────────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>

            <div className="mb-4">
              <label htmlFor="cemetery" className="block text-sm font-medium text-gray-700 mb-2">
                Cimetière <span className="text-red-500">*</span>
              </label>
              <select
                id="cemetery"
                value={formData.cemetery_id}
                onChange={handleField('cemetery_id')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cemetery_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Sélectionnez un cimetière</option>
                {cemeteries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.city} ({c.department})
                  </option>
                ))}
              </select>
              {errors.cemetery_id && <p className="mt-1 text-sm text-red-600">{errors.cemetery_id}</p>}
            </div>

            {/* Carte interactive — clic sur marqueur = sélection du cimetière */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2"> Ou cliquez directement sur un cimetière sur la carte</p>
              <CemeteryMap
                cemeteries={cemeteries}
                selectedId={formData.cemetery_id}
                onSelect={(cemetery) => {
                  setFormData(prev => ({ ...prev, cemetery_id: String(cemetery.id) }));
                  setErrors(prev => ({ ...prev, cemetery_id: '' }));
                }}
              />
            </div>

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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cemetery_location ? 'border-red-500' : 'border-gray-300'}`}
              />
              <p className="mt-1 text-xs text-gray-500">{formData.cemetery_location.length}/255 caractères</p>
              {errors.cemetery_location && <p className="mt-1 text-sm text-red-600">{errors.cemetery_location}</p>}
            </div>
          </div>

          {/* ── Section 2 : Service ──────────────────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de service</h2>

            {/* Groupe Entretien */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg"></span>
                <h3 className="font-semibold text-gray-700">Entretien de votre pierre tombale</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-3">
                {serviceCategories.filter(s => s.category === 'entretien').map(service => (
                  <label key={service.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${formData.service_category_id === String(service.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}>
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={formData.service_category_id === String(service.id)}
                      onChange={handleServiceChange}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                      </div>
                      <p className="text-lg font-bold text-blue-600 ml-4">
                        {parseFloat(service.base_price).toFixed(2)} €
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-4" />

            {/* Groupe Fleurs */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg"></span>
                <h3 className="font-semibold text-gray-700">Service de livraison de fleurs</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-3">
                {serviceCategories.filter(s => s.category === 'fleurs').map(service => (
                  <label key={service.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${formData.service_category_id === String(service.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}>
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={formData.service_category_id === String(service.id)}
                      onChange={handleServiceChange}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                      </div>
                      <p className="text-lg font-bold text-blue-600 ml-4">
                        {parseFloat(service.base_price).toFixed(2)} €
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {errors.service_category_id && <p className="mt-2 text-sm text-red-600">{errors.service_category_id}</p>}
          </div>

          {/* ── Section 3 : Commentaire optionnel ───────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Informations complémentaires</h2>
            <p className="text-sm text-gray-500 mb-3">Optionnel — précisez toute information utile pour le prestataire</p>
            <textarea
              value={formData.comment}
              onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Ex: La tombe est dans un état particulier, apporter des roses blanches, accès par le portail nord..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 text-right">{(formData.comment || '').length}/500 caractères</p>
          </div>

          {/* ── Section 4 : Récapitulatif ────────────────────────────────── */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix du service</span>
                <span className="font-semibold">{selectedPrice.toFixed(2)} €</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-blue-600">{selectedPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* ── Boutons ───────────────────────────────────────────────────── */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/dashboard/client')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Continuer vers le paiement
            </button>
          </div>

        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
             <strong>Bon à savoir :</strong> Le paiement sera effectué de manière sécurisée via Stripe. Votre commande sera créée après confirmation du paiement.
          </p>
        </div>

      </div>
    </div>
  );
}

export default NewOrder;
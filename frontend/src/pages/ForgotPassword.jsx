// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AuthLayout from '../components/layout/AuthLayout';
import axios from 'axios';
import Footer from '../components/layout/Footer';


function ForgotPassword() {
  const [telephone, setTelephone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!telephone.trim()) {
      setError('Le numéro de téléphone est obligatoire');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/auth/forgot-password', { telephone: telephone.trim() });
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue, veuillez réessayer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-24">
          <AuthLayout title="Code envoyé !" subtitle="">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 mb-2">
                Si ce numéro est enregistré, vous allez recevoir un SMS avec votre code de réinitialisation.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Le code est valable 15 minutes.
              </p>
              <Link
                to="/reset-password"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition">
                Saisir mon code →
              </Link>
              <Link to="/login" className="block mt-4 text-sm text-gray-500 hover:text-gray-700">
                Retour à la connexion
              </Link>
            </div>
          </AuthLayout>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24">
        <AuthLayout
          title="Mot de passe oublié"
          subtitle="Entrez votre numéro de téléphone pour recevoir un code de réinitialisation">

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="0612345678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50">
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Retour à la connexion
            </Link>
          </div>

        </AuthLayout>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default ForgotPassword;
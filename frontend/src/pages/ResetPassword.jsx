// frontend/src/pages/ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AuthLayout from '../components/layout/AuthLayout';
import axios from 'axios';
import Footer from '../components/layout/Footer';


function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ telephone: '', code: '', newPassword: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.telephone.trim() || !formData.code.trim() || !formData.newPassword.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    if (formData.newPassword !== formData.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/auth/reset-password', {
        telephone: formData.telephone.trim(),
        code: formData.code.trim(),
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Code invalide ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-24">
          <AuthLayout title="Mot de passe modifié !" subtitle="">
            <div className="text-center">
              <div className="text-6xl mb-4"></div>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la connexion...
              </p>
              <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition">
                Se connecter maintenant
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
          title="Nouveau mot de passe"
          subtitle="Entrez le code reçu par SMS et votre nouveau mot de passe">

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone}
                  onChange={handleChange} placeholder="0612345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code reçu par SMS</label>
                <input type="text" name="code" value={formData.code}
                  onChange={handleChange} placeholder="123456" maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input type="password" name="newPassword" value={formData.newPassword}
                  onChange={handleChange} placeholder="8 caractères minimum"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <input type="password" name="confirm" value={formData.confirm}
                  onChange={handleChange} placeholder="Répétez le mot de passe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50">
              {isSubmitting ? 'Vérification...' : 'Réinitialiser mon mot de passe'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Renvoyer un code
            </Link>
          </div>

        </AuthLayout>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default ResetPassword;
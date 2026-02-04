import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/forms/InputField';
import Button from '../components/forms/Button';
import { validateEmail } from '../utils/validators';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion du changement des inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Efface l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.email = validateEmail(formData.email);
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    // Retire les erreurs null
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });

    return newErrors;
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulation temporaire - sera remplacé par l'appel API
    console.log('Données de connexion:', formData);
    
    setTimeout(() => {
      alert('Connexion simulée avec succès ! (Backend à venir)');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-600 mt-2">Accédez à votre compte Mémoria</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="exemple@email.com"
              required
            />

            <InputField
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="********"
              required
            />

            {/* Case à cocher "Se souvenir de moi" */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>

              {/* Lien mot de passe oublié (UI seulement pour le MVP) */}
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => alert('Fonctionnalité "Mot de passe oublié" à venir')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          {/* Lien vers Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Note informative */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
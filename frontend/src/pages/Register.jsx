import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/forms/InputField';
import Button from '../components/forms/Button';
import { validateEmail, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validators';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion du changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    newErrors.role = validateRole(formData.role);

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
    console.log('Données du formulaire:', formData);
    
    setTimeout(() => {
      alert('Inscription simulée avec succès ! (Backend à venir)');
      setIsSubmitting(false);
      // Reset du formulaire
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
          <p className="text-gray-600 mt-2">Créez votre compte Mémoria</p>
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

            <InputField
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="********"
              required
            />

            {/* Sélection du rôle */}
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${
                  errors.role 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="client">Client - Je souhaite commander un service</option>
                <option value="prestataire">Prestataire - Je souhaite proposer mes services</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
            </Button>
          </form>

          {/* Lien vers Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
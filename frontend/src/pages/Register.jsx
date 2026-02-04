import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import Button from '../components/forms/Button';
import { validateEmail, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validators';
import logoMemoria from '../assets/Logos-Mémoria.jpeg';

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
            <img 
              src={logoMemoria} 
              alt="Logo Mémoria" 
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
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
            <SelectField
              label="Type de compte"
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              options={[
                { value: 'client', label: 'Client - Je souhaite commander un service' },
                { value: 'prestataire', label: 'Prestataire - Je souhaite proposer mes services' }
              ]}
              placeholder="Sélectionnez un rôle"
              required
            />

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
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import Button from '../components/forms/Button';
import useForm from '../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validators';

function Register() {
  // Valeurs initiales
  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  // Fonction de validation
  const validate = (data) => {
    const newErrors = {};
    
    newErrors.email = validateEmail(data.email);
    newErrors.password = validatePassword(data.password);
    newErrors.confirmPassword = validatePasswordConfirmation(data.password, data.confirmPassword);
    newErrors.role = validateRole(data.role);

    // Retire les erreurs null
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });

    return newErrors;
  };

  // Callback de soumission
  const onSubmit = async (data) => {
    console.log('Données du formulaire:', data);
    
    // Simulation temporaire - sera remplacé par l'appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Inscription simulée avec succès ! (Backend à venir)');
        resetForm(); // Reset après succès
        resolve();
      }, 1000);
    });
  };

  // Utilisation du hook
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  } = useForm(initialValues, validate, onSubmit);

  return (
    <AuthLayout 
      title="Inscription" 
      subtitle="Créez votre compte Mémoria"
    >
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
    </AuthLayout>
  );
}

export default Register;
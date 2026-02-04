import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import InputField from '../components/forms/InputField';
import Button from '../components/forms/Button';
import useForm from '../hooks/useForm';
import { validateEmail } from '../utils/validators';

function Login() {
  // Valeurs initiales
  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Fonction de validation
  const validate = (data) => {
    const newErrors = {};
    
    newErrors.email = validateEmail(data.email);
    
    if (!data.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    // Retire les erreurs null
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });

    return newErrors;
  };

  // Callback de soumission
  const onSubmit = async (data) => {
    console.log('Données de connexion:', data);
    
    // Simulation temporaire - sera remplacé par l'appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Connexion simulée avec succès ! (Backend à venir)');
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
    handleSubmit
  } = useForm(initialValues, validate, onSubmit);

  return (
    <AuthLayout 
      title="Connexion" 
      subtitle="Accédez à votre compte Mémoria"
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

      {/* Note informative */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../components/layout/AuthLayout';
import InputField from '../components/forms/InputField';
import Button from '../components/forms/Button';
import useForm from '../hooks/useForm';
import { validateEmail } from '../utils/validators';
import authService from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  const validate = (data) => {
    const newErrors = {};
    
    newErrors.email = validateEmail(data.email);
    
    if (!data.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });

    return newErrors;
  };

const onSubmit = async (data) => {
  try {
    setApiError(null);

    console.log('📤 Tentative de connexion:', data.email);

    // authService.login() renvoie { token, user }
    const result = await authService.login(data.email, data.password);
    
    console.log('✅ Connexion réussie:', result);
    console.log('👤 User complet:', result.user);  // ← Corrigé
    console.log('👤 Rôle utilisateur:', result.user.role);  // ← Corrigé

    // Redirection selon le rôle
    switch (result.user.role) {  // ← Corrigé
      case 'client':
        navigate('/dashboard/client');
        break;
      case 'prestataire':
        navigate('/dashboard/prestataire');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      default:
        console.error('❌ Rôle non reconnu:', result.user.role);
        setApiError('Rôle utilisateur non reconnu');
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    setApiError(error.message);
  }
};

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
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </p>
          </div>
        )}

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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            S'inscrire
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
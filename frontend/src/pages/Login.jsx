// frontend/src/pages/Login.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../components/layout/AuthLayout';
import InputField from '../components/forms/InputField';
import Button from '../components/forms/Button';
import useForm from '../hooks/useForm';
import { validateEmail } from '../utils/validators';
import authService from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState(null);

  const initialValues = { email: '', password: '', rememberMe: false };

  const validate = (data) => {
    const errors = {};
    const emailErr = validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
    if (!data.password) errors.password = 'Le mot de passe est requis';
    return errors;
  };

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const result = await authService.login(data.email, data.password);
      login(result.user, result.token);

      switch (result.user.role) {
        case 'client': navigate('/dashboard/client'); break;
        case 'prestataire': navigate('/dashboard/prestataire'); break;
        case 'admin': navigate('/dashboard/admin'); break;
        default:
          setApiError('Rôle utilisateur non reconnu');
      }
    } catch (error) {
      setApiError(error.message);
    }
  };

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialValues, validate, onSubmit);

  return (
    <>
      <Navbar />
      <div className="pt-24">
        <AuthLayout title="Connexion" subtitle="Accédez à votre compte Mémoria">

          <form onSubmit={handleSubmit}>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
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
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default Login;
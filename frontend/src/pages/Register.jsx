// frontend/src/pages/Register.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout   from '../components/layout/AuthLayout';
import InputField   from '../components/forms/InputField';
import SelectField  from '../components/forms/SelectField';
import Button       from '../components/forms/Button';
import useForm      from '../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validators';
import authService  from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import Navbar       from '../components/layout/Navbar';

const ZONES = [
  { value: 'Bordeaux',     label: 'Bordeaux et environs (30km)'    },
  { value: 'Pau',          label: 'Pau et alentours (30km)'        },
  { value: 'La Rochelle',  label: 'La Rochelle et environs (30km)' },
  { value: 'Limoges',      label: 'Limoges et alentours (30km)'    },
  { value: 'Poitiers',     label: 'Poitiers et environs (30km)'    },
];

const ROLES = [
  { value: 'client',      label: 'Client — Je souhaite commander un service'     },
  { value: 'prestataire', label: 'Prestataire — Je souhaite proposer mes services' },
];

function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState(null);

  const initialValues = {
    email:             '',
    password:          '',
    confirmPassword:   '',
    prenom:            '',
    nom:               '',
    role:              '',
    siret:             '',
    zone_intervention: '',
  };

  const validate = (data) => {
    const errors = {};

    const emailErr    = validateEmail(data.email);
    const passwordErr = validatePassword(data.password);
    const confirmErr  = validatePasswordConfirmation(data.password, data.confirmPassword);
    const roleErr     = validateRole(data.role);

    if (emailErr)    errors.email           = emailErr;
    if (passwordErr) errors.password        = passwordErr;
    if (confirmErr)  errors.confirmPassword = confirmErr;
    if (roleErr)     errors.role            = roleErr;

    if (!data.prenom?.trim()) errors.prenom = 'Le prénom est requis';
    if (!data.nom?.trim())    errors.nom    = 'Le nom est requis';

    if (data.role === 'prestataire') {
      if (!data.siret?.trim()) {
        errors.siret = 'Le numéro SIRET est requis pour les prestataires';
      } else if (!/^\d{14}$/.test(data.siret)) {
        errors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
      }
      if (!data.zone_intervention?.trim()) {
        errors.zone_intervention = "La zone d'intervention est requise";
      }
    }

    return errors;
  };

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const payload = {
        email:   data.email,
        password: data.password,
        prenom:  data.prenom,
        nom:     data.nom,
        role:    data.role,
      };

      if (data.role === 'prestataire') {
        payload.siret             = data.siret;
        payload.zone_intervention = data.zone_intervention;
      }

      const response = await authService.register(payload);
      login(response.user, response.token);

      // Résolution du rôle (fallback sur role_id si besoin)
      const roleMap  = { 1: 'client', 2: 'prestataire', 3: 'admin' };
      const userRole = response.user?.role || roleMap[response.user?.role_id];

      if (userRole === 'client')      navigate('/dashboard/client');
      else if (userRole === 'prestataire') navigate('/dashboard/prestataire/pending');
      else                            navigate('/');

    } catch (error) {
      setApiError(error.message);
    }
  };

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialValues, validate, onSubmit);

  const isPrestataire = formData.role === 'prestataire';

  return (
    <>
      <Navbar />
      <div className="pt-24">
        <AuthLayout title="Inscription" subtitle="Créez votre compte Mémoria">

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

            <InputField label="Email"   type="email"  name="email"  value={formData.email}  onChange={handleChange} error={errors.email}  placeholder="exemple@email.com" required />
            <InputField label="Prénom"  type="text"   name="prenom" value={formData.prenom} onChange={handleChange} error={errors.prenom} placeholder="Jean"              required />
            <InputField label="Nom"     type="text"   name="nom"    value={formData.nom}    onChange={handleChange} error={errors.nom}    placeholder="Dupont"            required />

            <InputField label="Mot de passe"           type="password" name="password"        value={formData.password}        onChange={handleChange} error={errors.password}        placeholder="********" required />
            <InputField label="Confirmer le mot de passe" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="********" required />

            <SelectField
              label="Type de compte"
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              options={ROLES}
              placeholder="Sélectionnez un rôle"
              required
            />

            {isPrestataire && (
              <>
                <InputField
                  label="Numéro SIRET"
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  error={errors.siret}
                  placeholder="12345678901234"
                  maxLength={14}
                  required
                />
                <SelectField
                  label="Zone d'intervention"
                  name="zone_intervention"
                  value={formData.zone_intervention}
                  onChange={handleChange}
                  error={errors.zone_intervention}
                  options={ZONES}
                  placeholder="Sélectionnez votre zone"
                  required
                />
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ Votre compte sera examiné par un administrateur avant activation.
                  </p>
                </div>
              </>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
            </Button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>

        </AuthLayout>
      </div>
    </>
  );
}

export default Register;
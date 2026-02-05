import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../components/layout/AuthLayout';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import Button from '../components/forms/Button';
import useForm from '../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validators';
import authService from '../services/authService';

function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  // Valeurs initiales avec champs prestataires
  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Champs spécifiques prestataires
    siret: '',
    zone_intervention: ''
  };

  // Fonction de validation enrichie
  const validate = (data) => {
    const newErrors = {};
    
    newErrors.email = validateEmail(data.email);
    newErrors.password = validatePassword(data.password);
    newErrors.confirmPassword = validatePasswordConfirmation(data.password, data.confirmPassword);
    newErrors.role = validateRole(data.role);

    // Validation conditionnelle pour les prestataires
    if (data.role === 'prestataire') {
      if (!data.siret || data.siret.trim() === '') {
        newErrors.siret = "Le numéro SIRET est requis pour les prestataires";
      } else if (!/^\d{14}$/.test(data.siret)) {
        newErrors.siret = "Le SIRET doit contenir exactement 14 chiffres";
      }

      if (!data.zone_intervention || data.zone_intervention.trim() === '') {
        newErrors.zone_intervention = "La zone d'intervention est requise";
      }
    }

    // Retire les erreurs null
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });

    return newErrors;
  };

  // Callback de soumission
  const onSubmit = async (data) => {
    try {
      setApiError(null);

      // Préparation des données selon le rôle
      const registrationData = {
        email: data.email,
        password: data.password,
        role: data.role,
      };

      // Ajout des champs prestataires si nécessaire
      if (data.role === 'prestataire') {
        registrationData.siret = data.siret;
        registrationData.zone_intervention = data.zone_intervention;
      }

      console.log('📤 Envoi des données:', registrationData);

      // Appel à l'API
      const response = await authService.register(registrationData);
      
      console.log('✅ Inscription réussie:', response);

      // Récupération du rôle depuis la réponse
      // Adaptation: conversion de role_id en role string
      let userRole = response.user?.role;
      
      // Si le backend renvoie role_id au lieu de role
      if (!userRole && response.user?.role_id) {
        const roleMapping = {
          1: 'client',
          2: 'prestataire',
          3: 'admin'
        };
        userRole = roleMapping[response.user.role_id];
      }

      // Redirection selon le rôle
      if (userRole === 'client') {
        navigate('/dashboard/client');
      } else if (userRole === 'prestataire') {
        navigate('/dashboard/prestataire/pending');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error.message);
      setApiError(error.message);
    }
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm(initialValues, validate, onSubmit);

  // Affichage conditionnel des champs prestataires
  const showPrestataireFields = formData.role === 'prestataire';

  return (
    <AuthLayout 
      title="Inscription" 
      subtitle="Créez votre compte Mémoria"
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

        {/* Champs conditionnels pour les prestataires */}
        {showPrestataireFields && (
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
              options={[
                { value: 'Bordeaux', label: 'Bordeaux et environs (30km)' },
                { value: 'Pau', label: 'Pau et alentours (30km)' },
                { value: 'La Rochelle', label: 'La Rochelle et environs (30km)' },
                { value: 'Limoges', label: 'Limoges et alentours (30km)' },
                { value: 'Poitiers', label: 'Poitiers et environs (30km)' }
              ]}
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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
        >
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
  );
}

export default Register;
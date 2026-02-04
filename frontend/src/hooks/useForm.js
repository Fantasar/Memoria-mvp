import { useState } from 'react';

/**
 * Custom hook pour gérer les formulaires
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} validateFunction - Fonction de validation personnalisée
 * @param {Function} onSubmitCallback - Fonction appelée lors de la soumission
 */
function useForm(initialValues, validateFunction, onSubmitCallback) {
  const [formData, setFormData] = useState(initialValues);
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

  // Reset du formulaire
  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateFunction(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitCallback(formData);
      // Le callback peut décider de reset ou non
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setErrors // Utile pour les erreurs du backend
  };
}

export default useForm;
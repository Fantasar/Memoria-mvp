// frontend/src/components/forms/SelectField.jsx

/**
 * Champ de sélection réutilisable avec label, validation et accessibilité.
 * Pattern identique à InputField pour la cohérence des formulaires.
 *
 * @param {string}   label       - Libellé affiché au-dessus du champ
 * @param {string}   name        - Attribut name/id (doit être unique dans le formulaire)
 * @param {string}   value       - Valeur contrôlée
 * @param {Function} onChange    - Handler de changement
 * @param {string}   error       - Message d'erreur (affiche le champ en rouge si défini)
 * @param {{value: string, label: string}[]} options     - Liste des options
 * @param {boolean}  required    - Affiche un astérisque rouge si true
 * @param {string}   placeholder - Texte de l'option vide (défaut: 'Sélectionnez une option')
 */
function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options     = [],
  required    = false,
  placeholder = 'Sélectionnez une option'
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${name}-error`} className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default SelectField;
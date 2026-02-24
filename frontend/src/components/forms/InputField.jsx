// frontend/src/components/forms/InputField.jsx

/**
 * Champ de formulaire réutilisable avec label, validation et accessibilité.
 *
 * @param {string}   label       - Libellé affiché au-dessus du champ
 * @param {string}   type        - Type HTML de l'input (défaut: 'text')
 * @param {string}   name        - Attribut name/id (doit être unique dans le formulaire)
 * @param {string}   value       - Valeur contrôlée
 * @param {Function} onChange    - Handler de changement
 * @param {string}   error       - Message d'erreur (affiche le champ en rouge si défini)
 * @param {string}   placeholder - Texte indicatif
 * @param {boolean}  required    - Affiche un astérisque rouge si true
 */
function InputField({
  label,
  type        = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required    = false
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      {error && (
        <p id={`${name}-error`} className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
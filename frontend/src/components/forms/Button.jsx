// frontend/src/components/forms/Button.jsx

/**
 * Composant bouton réutilisable avec variantes de style.
 *
 * @param {React.ReactNode} children   - Contenu du bouton
 * @param {'button'|'submit'|'reset'}  type      - Type HTML du bouton (défaut: 'button')
 * @param {Function}        onClick    - Handler de clic
 * @param {boolean}         disabled   - Désactive le bouton
 * @param {'primary'|'secondary'|'danger'} variant - Variante visuelle
 * @param {boolean}         fullWidth  - Prend toute la largeur disponible
 */
function Button({
  children,
  type     = 'button',
  onClick,
  disabled = false,
  variant  = 'primary',
  fullWidth = false
}) {
  const base = 'px-4 py-2 rounded-md font-medium transition focus:outline-none focus:ring-2';

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        base,
        variants[variant] ?? variants.primary,
        fullWidth ? 'w-full' : '',
        disabled  ? 'cursor-not-allowed' : 'cursor-pointer'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default Button;
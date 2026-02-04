function Button({ 
  children, 
  type = "button", 
  onClick, 
  disabled = false,
  variant = "primary",
  fullWidth = false 
}) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition focus:outline-none focus:ring-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
}

export default Button;
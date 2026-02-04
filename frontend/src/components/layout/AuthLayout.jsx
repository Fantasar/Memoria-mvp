import logoMemoria from '../../assets/Logos-Mémoria.jpeg';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* En-tête avec logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logoMemoria} 
              alt="Logo Mémoria" 
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {/* Contenu (formulaire) */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
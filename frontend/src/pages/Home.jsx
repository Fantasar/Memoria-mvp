function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bienvenue sur Mémoria
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Plateforme d'entretien de sépultures
        </p>
        <div className="space-x-4">
          <span className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Je suis client
          </span>
          <span className="px-6 py-3 bg-green-600 text-white rounded-lg">
            Je suis prestataire
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
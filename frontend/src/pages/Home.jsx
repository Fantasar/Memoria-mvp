import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logoMemoria from '../assets/Logos_Mémoria-remove.png';
import elephants from '../assets/éléphant.png';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold">M</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
            </div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-900 hover:text-blue-600 font-medium transition">
                Accueil
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 transition">
                Services
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">
                À propos
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-40">
        {/* Petites étoiles décoratives (gauche) */}
        <div className="absolute left-20 top-1/3 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-amber-200"
              style={{
                left: `${Math.random() * 150}px`,
                top: `${Math.random() * 300}px`,
                fontSize: `${Math.random() * 20 + 10}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}
        </div>
        <div>
          {/* Contenu principal */}
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte gauche */}
            <div className="space-y-6 ml-8">
              <p className="text-gray-600 text-lg font-light tracking-wide">
                Plantes et Fleurs de saison
              </p>

              <h1 className="text-6xl lg:text-6xl font-serif font-bold leading-tight">
                LES PLUS BELLES JE FAIS UN TEST                D
                <span className="text-gray-800">FLEURS À OFFRIR</span>
              </h1>

              <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
                Une sélection de fleurs et plantes de saison à offrir pour toutes les occasions
              </p>

              <div className="flex gap-4 pt-4">
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Commencer maintenant
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
                >
                  Découvrir nos services
                </Link>
              </div>
            </div>
          </div>
            {/* Logo M géant à droite */}
            <div className="absolute top-1/2 -translate-y-1/2 w-1/2 overflow-hidden hidden lg:block pointer-events-none"
            style={{ right: '-380px' }}>
              <img
                src={logoMemoria}
                alt="Logo Mémoria"
                className="h-[780px] w-auto object-contain"
              />
            </div>

          {/* Éléphants en bas */}
          <div className="absolute bottom-20 left-0 right-0">
            <div className="max-w-7xl mx-auto px-6 relative">
              <div className="h-40 flex items-end justify-start relative">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
                <img
                  src={elephants}
                  alt="Silhouettes éléphants"
                  className="h-68 w-auto object-contain relative z-10"
                  style={{ marginBottom: '-155px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flèche scroll */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ animation: 'bounce 2s infinite' }}
        >
          <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </section>

      {/* Section suivante (Comment ça marche) */}
      <section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold text-center mb-16">
            Comment ça fonctionne ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Étape 1 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-2xl font-semibold">Choisissez un service</h3>
              <p className="text-gray-600">
                Sélectionnez le type d'entretien adapté aux besoins de la sépulture
              </p>
            </div>

            {/* Étape 2 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-semibold">Un prestataire intervient</h3>
              <p className="text-gray-600">
                Un professionnel certifié se charge de l'entretien avec soin et respect
              </p>
            </div>

            {/* Étape 3 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-2xl font-semibold">Validez le résultat</h3>
              <p className="text-gray-600">
                Recevez des photos avant/après et validez la prestation réalisée
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-serif text-xl mb-4">Mémoria</h4>
              <p className="text-gray-400 text-sm">
                Entretien de sépultures avec respect et professionnalisme
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Nettoyage de tombes</li>
                <li>Fleurissement</li>
                <li>Rénovation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>À propos</li>
                <li>Contact</li>
                <li>Mentions légales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-gray-400">
                contact@memoria.fr
                <br />
                Bordeaux, France
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2026 Mémoria. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logoMemoria from '../assets/Logos_Mémoria-remove.png';
import elephants from '../assets/éléphant.png';
import avantTombe01 from '../assets/Avant-tombe01.jpg';
import apresTombe01 from '../assets/Aprés-tombe01.jpg';
import avantTombe02 from '../assets/Avant-tombe02.jpg';
import apresTombe02 from '../assets/Aprés-tombe02.jpg';
import photoSophie from '../assets/sophie-dubois.png';
import photoJean from '../assets/jean-lefevre.png';
import photoMarie from '../assets/marie-rousseau.png';
import photoPaul from '../assets/paul-martin.png';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [ballPosition, setBallPosition] = useState({ top: 0, left: 210 });
  const [sliderPosition1, setSliderPosition1] = useState(50);
  const [sliderPosition2, setSliderPosition2] = useState(70);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Tracking souris pour la bille
    const handleMouseMove = (e) => {
      const section = document.querySelector('#comment-ca-marche-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const mouseX = e.clientX - rect.left;
      const sectionHeight = rect.height;

      if (mouseY < 0 || mouseY > sectionHeight || mouseX < 0 || mouseX > rect.width) {
        return;
      }

      const startY = 150;
      const verticalLineHeight = sectionHeight - 92;
      const horizontalLineY = sectionHeight - 92;

      let newTop, newLeft;

      if (mouseY < startY) {
        newTop = startY;
        newLeft = 210;
      } else if (mouseY < verticalLineHeight) {
        newTop = Math.max(startY, Math.min(mouseY, verticalLineHeight));
        newLeft = 210;
      } else if (mouseX < 210) {
        newTop = verticalLineHeight;
        newLeft = 210;
      } else {
        newTop = horizontalLineY;
        newLeft = Math.max(210, Math.min(mouseX, 550));
        
        if (mouseY > horizontalLineY + 50) {
          const fallDistance = Math.min(mouseY - horizontalLineY, 200);
          newTop = horizontalLineY + fallDistance;
        }
      }

      setBallPosition({ top: newTop, left: newLeft });
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Animation des compteurs
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && counter.textContent === '0') {
              updateCounter();
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
      });
    };
    
    animateCounters();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ============================================
          NAVBAR
      ============================================ */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold">M</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-gray-900 hover:text-blue-600 font-medium transition"
                >
                Accueil
              </Link>
              <Link
                to="/"
                onClick={() => {
                  const section = document.getElementById('comment-ca-marche-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                Services
              </Link>
              <Link
                to="/"
                onClick={() => {
                  document
                  .getElementById('faq-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition"
                >
                À propos
              </Link>

              <Link
                to="/"
                onClick={() => {
                  document
                  .getElementById('team-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition"
                >
                Contact
              </Link>
            </div>

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


      {/* ============================================
          HERO SECTION
      ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-40">
        
        <div className="absolute left-20 top-1/3 opacity-40 pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <div
              key={`gold-${i}`}
              className="absolute text-amber-200" 
              style={{
                left: `${Math.random() * 200}px`,
                top: `${Math.random() * 350}px`,
                fontSize: `${Math.random() * 24 + 12}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(8)].map((_, i) => (
            <div
              key={`purple-${i}`}
              className="absolute text-purple-300"
              style={{
                left: `${Math.random() * 200}px`,
                top: `${Math.random() * 350}px`,
                fontSize: `${Math.random() * 20 + 10}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(10)].map((_, i) => (
            <div
              key={`blue-${i}`}
              className="absolute text-sky-200"
              style={{
                left: `${Math.random() * 200}px`,
                top: `${Math.random() * 350}px`,
                fontSize: `${Math.random() * 18 + 8}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(8)].map((_, i) => (
            <div
              key={`white-${i}`}
              className="absolute text-white/70"
              style={{
                left: `${Math.random() * 200}px`,
                top: `${Math.random() * 350}px`,
                fontSize: `${Math.random() * 14 + 6}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 ml-6">
            <p className="text-gray-800 text-4xl font-light tracking-wide">
              Honorer leur mémoire avec dignité
            </p>

            <h1 className="text-6xl lg:text-8xl font-serif font-bold leading-tight">
              <span className="whitespace-nowrap">PRENEZ SOIN DE</span>
              <br />
              <span className="whitespace-nowrap bg-green-200 px-2">LEUR REPOS</span>
            </h1>

            <p className="text-gray-600 text-4xl max-w-xl leading-relaxed">
              Confiez l'entretien des sépultures à{' '}
              <span className="bg-blue-200 px-2">des professionnels certifiés.</span>
              <br />
              <span className="whitespace-nowrap">Respect, dignité et transparence garantis.</span>
            </p>

<div className="flex gap-4 pt-4 relative z-20">
  <Link
    to="/register"
    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
  >
    Commencer maintenant
  </Link>

<Link
  to="/"
  onClick={() => {
    document
      .getElementById('comment-ca-marche-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all"
>
  Découvrir nos services
</Link>
</div>
          </div>
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 w-1/2 overflow-hidden hidden lg:block pointer-events-none"
          style={{ right: '-380px' }}
        >
          <img
            src={logoMemoria}
            alt="Logo Mémoria"
            className="h-[780px] w-auto object-contain"
          />
        </div>

        <div className="absolute bottom-20 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="h-40 flex items-end justify-start relative">
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-black"></div>
              <img
                src={elephants}
                alt="Silhouettes éléphants"
                className="w-auto object-contain relative z-10"
                style={{ height: '700px', marginBottom: '-302px' }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
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


      {/* ============================================
          COMMENT ÇA MARCHE
      ============================================ */}
      <section 
        id="comment-ca-marche-section"
        className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 py-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          
          <h2 className="text-5xl font-serif font-bold text-center mb-4 text-gray-900">
            <span className="bg-green-200 px-2">Comment ça fonctionne ?</span>
          </h2>
          <p className="text-center text-gray-600 text-lg mb-20">
            Un parcours simple en 3 étapes
          </p>

          <div className="space-y-6">
            
            {/* Étape 1 */}
            <div className="group relative overflow-hidden rounded-r-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl z-10 group-hover:w-24 transition-all duration-500">
                <span>1</span>
              </div>

              <div className="ml-20 bg-white p-8 group-hover:ml-24 transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Choisissez un service
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      Sélectionnez le type d'entretien adapté aux besoins de la sépulture : 
                      nettoyage, fleurissement ou rénovation.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Tarifs transparents affichés à l'avance</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Paiement sécurisé par Stripe</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="group relative overflow-hidden rounded-r-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl z-10 group-hover:w-24 transition-all duration-500">
                <span>2</span>
              </div>

              <div className="ml-20 bg-white p-8 group-hover:ml-24 transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Un prestataire intervient
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      Un professionnel certifié se charge de l'entretien avec soin et respect, 
                      dans votre zone d'intervention.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Prestataires vérifiés et certifiés</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Intervention rapide dans votre région</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="group relative overflow-hidden rounded-r-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl z-10 group-hover:w-24 transition-all duration-500">
                <span>3</span>
              </div>

              <div className="ml-20 bg-white p-8 group-hover:ml-24 transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Validez le résultat
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      Recevez des photos avant/après et validez la prestation réalisée. 
                      Votre satisfaction est garantie.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Photos avant/après systématiques</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Paiement libéré uniquement après validation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="absolute bottom-20 left-[230px] pointer-events-none z-20">
            <div className="flex flex-col items-start">
              <div className="w-[4px] h-[920px] bg-black"></div>
              <div className="w-80 h-[4px] bg-black"></div>
            </div>
          </div>

          <div 
            className="absolute pointer-events-none z-30 transition-all duration-100"
            style={{
              top: `${ballPosition.top}px`,
              left: `${ballPosition.left}px`,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4), inset -2px -2px 8px rgba(0,0,0,0.2)',
              transform: `rotate(${ballPosition.top * 2 + ballPosition.left}deg)`,
              opacity: ballPosition.top > 1010 ? Math.max(0, 1 - (ballPosition.top - 1010) / 100) : 1,
            }}
          />

          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>

        <div className="absolute right-20 top-0 bottom-0 w-48 opacity-40 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`gold-right-${i}`}
              className="absolute text-amber-200"
              style={{
                right: `${Math.random() * 150}px`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 24 + 12}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(8)].map((_, i) => (
            <div
              key={`blue-right-${i}`}
              className="absolute text-sky-200"
              style={{
                right: `${Math.random() * 150}px`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 18 + 8}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(6)].map((_, i) => (
            <div
              key={`purple-right-${i}`}
              className="absolute text-purple-300"
              style={{
                right: `${Math.random() * 150}px`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {[...Array(6)].map((_, i) => (
            <div
              key={`white-right-${i}`}
              className="absolute text-white/70"
              style={{
                right: `${Math.random() * 150}px`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 14 + 6}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}
        </div>
      </section>


      {/* ============================================
          STATISTIQUES
      ============================================ */}
      <section className="w-screen bg-gradient-to-br from-orange-300 to-orange-300 py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">
              Mémoria en chiffres
            </h2>
            <p className="text-orange-100 text-lg">
              La confiance de centaines de familles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:scale-105 transition">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-white mb-2 counter" data-target="247">
                0
              </div>
              <div className="text-white font-medium">
                Interventions réalisées
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:scale-105 transition">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-white mb-2 counter" data-target="42">
                0
              </div>
              <div className="text-white font-medium">
                Prestataires partenaires
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:scale-105 transition">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-white mb-2 counter" data-target="1854">
                0
              </div>
              <div className="text-white font-medium">
                Visites sur le site
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================
    AVIS CLIENTS
============================================ */}
<section className="bg-white py-20 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6">
    
    <div className="text-center mb-16">
      <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
        Ils nous font confiance
      </h2>
      <p className="text-gray-600 text-lg">
        Des centaines de familles satisfaites
      </p>
    </div>

    {/* Slider d'avis qui défile */}
    <div className="relative">
      


      {/* Container qui défile */}
      <div className="flex gap-6 animate-scroll">
        
        {/* Avis 1 */}
        <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            "Service impeccable. Le prestataire a été très respectueux et professionnel. 
            Les photos avant/après sont parfaites. Je recommande vivement."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              MC
            </div>
            <div>
              <p className="font-semibold text-gray-900">Marie Chevalier</p>
              <p className="text-sm text-gray-500">Bordeaux</p>
            </div>
          </div>
        </div>

        {/* Avis 2 */}
        <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            "Habitant loin du cimetière familial, ce service est une vraie solution. 
            Transparence totale et qualité irréprochable. Merci Mémoria !"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
              PD
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pierre Dubois</p>
              <p className="text-sm text-gray-500">Paris</p>
            </div>
          </div>
        </div>

        {/* Avis 3 */}
        <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            "Excellent rapport qualité-prix. Le prestataire a même ajouté de jolies 
            fleurs de saison. Un vrai soulagement pour moi."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              AL
            </div>
            <div>
              <p className="font-semibold text-gray-900">Anne Laurent</p>
              <p className="text-sm text-gray-500">Limoges</p>
            </div>
          </div>
        </div>

        {/* Avis 4 */}
        <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            "Interface simple et claire. Paiement sécurisé. Le travail effectué 
            correspond exactement à mes attentes. Parfait."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
              JM
            </div>
            <div>
              <p className="font-semibold text-gray-900">Jacques Martin</p>
              <p className="text-sm text-gray-500">Pau</p>
            </div>
          </div>
        </div>

        {/* Dupliquer les avis pour l'effet de boucle infinie */}
        <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            "Service impeccable. Le prestataire a été très respectueux et professionnel. 
            Les photos avant/après sont parfaites. Je recommande vivement."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              MC
            </div>
            <div>
              <p className="font-semibold text-gray-900">Marie Chevalier</p>
              <p className="text-sm text-gray-500">Bordeaux</p>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>

  {/* Animation CSS */}
  <style jsx>{`
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    
    .animate-scroll {
      animation: scroll 40s linear infinite;
    }
    
    .animate-scroll:hover {
      animation-play-state: paused;
    }
  `}</style>
</section>



      {/* ============================================
          FAQ + GALERIE AVANT/APRÈS
      ============================================ */}
      <section
        id="faq-section"
        className="bg-gradient-to-b from-gray-50 to-white py-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* FAQ */}
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">
                Questions fréquentes
              </h2>

              <div className="space-y-4">
                
                <details className="group bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comment fonctionne le paiement ?
                    </h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    Le paiement s'effectue en ligne via Stripe de manière 100% sécurisée. 
                    Le montant est bloqué jusqu'à validation des photos avant/après par vos soins. 
                    Vous ne payez que si vous êtes satisfait du résultat.
                  </div>
                </details>

                <details className="group bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Qui sont les prestataires ?
                    </h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    Tous nos prestataires sont des professionnels certifiés et vérifiés. 
                    Ils sont spécialisés dans l'entretien de sépultures et interviennent 
                    avec respect et dignité. Chaque prestataire est noté par les clients.
                  </div>
                </details>

                <details className="group bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Puis-je annuler une commande ?
                    </h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    Oui, vous pouvez annuler gratuitement tant que le prestataire n'a pas 
                    encore accepté la mission. Une fois acceptée, des frais d'annulation 
                    peuvent s'appliquer selon le délai.
                  </div>
                </details>

                <details className="group bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Les photos sont-elles garanties ?
                    </h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    Absolument ! Des photos avant et après sont systématiquement prises 
                    par le prestataire. Vous les recevez dans votre espace personnel et 
                    devez valider le travail avant que le paiement ne soit libéré.
                  </div>
                </details>

                <details className="group bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dans quelles zones intervenez-vous ?
                    </h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    Nous couvrons actuellement toute la région Nouvelle-Aquitaine 
                    (Bordeaux, Pau, Limoges, Poitiers...). Notre réseau de prestataires 
                    s'étend progressivement sur tout le territoire français.
                  </div>
                </details>

              </div>
            </div>

            {/* Slider Avant/Après */}
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">
                <span className="bg-blue-200 px-2">Résultats garantis</span>
              </h2>

              <div className="space-y-8">
                
                {/* Slider 1 */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div 
                    className="relative h-80 group cursor-ew-resize"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = (x / rect.width) * 100;
                      setSliderPosition1(Math.min(Math.max(percentage, 0), 100));
                    }}
                  >
                    
                    <div className="absolute inset-0">
                      <img 
                        src={avantTombe01} 
                        alt="Sépulture avant nettoyage" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        AVANT
                      </div>
                    </div>

                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition1}% 0 0)` }}
                    >
                      <img 
                        src={apresTombe01} 
                        alt="Sépulture après nettoyage" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        APRÈS
                      </div>
                    </div>

                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10 pointer-events-none"
                      style={{ left: `${sliderPosition1}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white text-lg font-semibold">
                        Nettoyage complet - Cimetière de Bordeaux
                      </p>
                    </div>

                  </div>
                </div>

                {/* Slider 2 */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div 
                    className="relative h-80 group cursor-ew-resize"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = (x / rect.width) * 100;
                      setSliderPosition2(Math.min(Math.max(percentage, 0), 100));
                    }}
                  >
                    
                    <div className="absolute inset-0">
                      <img 
                        src={avantTombe02} 
                        alt="Fleurs fanées" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        AVANT
                      </div>
                    </div>

                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition2}% 0 0)` }}
                    >
                      <img 
                        src={apresTombe02} 
                        alt="Fleurs fraîches" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        APRÈS
                      </div>
                    </div>

                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10 pointer-events-none"
                      style={{ left: `${sliderPosition2}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white text-lg font-semibold">
                        Nettoyage complet - Cimetière de Mérignac
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Commander un service
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>


{/* ============================================
    NOTRE ÉQUIPE
============================================ */}
<section
  id="team-section"
  className="bg-black text-white py-20 relative overflow-hidden"
>  
  <div className="absolute inset-0 opacity-30 pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <div
        key={`star-team-${i}`}
        className="absolute text-white"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 3 + 1}px`,
        }}
      >
        ●
      </div>
    ))}
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    
    <div className="text-center mb-20">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
          <span className="text-lg font-serif font-bold">M</span>
        </div>
        <span className="text-sm font-semibold tracking-wider uppercase text-gray-400">
          Mémoria
        </span>
      </div>
      
      <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
        Notre équipe
      </h2>
      
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        Des professionnels passionnés au service de votre sérénité
      </p>
    </div>

    {/* Grid 4 colonnes */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      
      {/* Paul Martin - Bleu */}
      <div className="group">
        <div className="relative mb-4 overflow-hidden" style={{ width: '240px', height: '320px' }}>
          <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <img 
            src={photoPaul} 
            alt="Paul Martin" 
            className="relative w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-bold text-xl mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Paul Martin
        </h3>
        <p className="text-gray-400 text-sm">
          Fondateur & Développeur
        </p>
      </div>

      {/* Sophie Dubois - Vert */}
      <div className="group">
        <div className="relative mb-4 overflow-hidden" style={{ width: '240px', height: '320px' }}>
          <div className="absolute -inset-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <img 
            src={photoSophie} 
            alt="Sophie Dubois" 
            className="relative w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-bold text-xl mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Sophie Dubois
        </h3>
        <p className="text-gray-400 text-sm">
          Responsable Qualité
        </p>
      </div>

      {/* Jean Lefebvre - Violet */}
      <div className="group">
        <div className="relative mb-4 overflow-hidden" style={{ width: '240px', height: '320px' }}>
          <div className="absolute -inset-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <img 
            src={photoJean} 
            alt="Jean Lefevre" 
            className="relative w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-bold text-xl mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Jean Lefevre
        </h3>
        <p className="text-gray-400 text-sm">
          Coordinateur Prestataires
        </p>
      </div>

      {/* Marie Rousseau - Orange */}
      <div className="group">
        <div className="relative mb-4 overflow-hidden" style={{ width: '240px', height: '320px' }}>
          <div className="absolute -inset-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <img 
            src={photoMarie} 
            alt="Marie Rousseau" 
            className="relative w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-bold text-xl mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Marie Rousseau
        </h3>
        <p className="text-gray-400 text-sm">
          Support Client
        </p>
      </div>

    </div>

  </div>
</section>


      {/* ============================================
          FOOTER
      ============================================ */}
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
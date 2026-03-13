// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import logoMemoria from '../assets/Logos_Mémoria-remove.png';
import elephants from '../assets/éléphant.png';
import avantTombe01 from '../assets/Avant-tombe01.jpg';
import apresTombe01 from '../assets/Aprés-tombe01.jpg';
import avantTombe02 from '../assets/Avant-tombe02.jpg';
import apresTombe02 from '../assets/Aprés-tombe02.jpg';
import photoPhilippe from '../assets/Philippe.png';
import iconcommande from '../assets/commande.png';
import iconcamion from '../assets/camion.png';
import iconconfiance from '../assets/inspection.png';
import iconnettoyage from '../assets/nettoyage.png';
import iconinspection from '../assets/inspection.png';
import iconvisite from '../assets/visite.png';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';



// ─── Étoiles décoratives fixées à la génération ───────────────────────────────
// useMemo/useRef pour éviter les positions différentes à chaque re-render
function Stars({ colors, count, style = {} }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 200,
      top: Math.random() * 350,
      size: Math.random() * 24 + 12,
      angle: Math.random() * 360,
    }))
  ).current;

  return (
    <>
      {stars.map(s => (
        <div
          key={s.id}
          className={`absolute ${colors}`}
          style={{
            left: `${s.left}px`,
            top: `${s.top}px`,
            fontSize: `${s.size}px`,
            transform: `rotate(${s.angle}deg)`,
            ...style,
          }}
        >
          
        </div>
      ))}
    </>
  );
}

// Ensemble d'étoiles multicolores pour la section hero (gauche)
function HeroStarsLeft() {
  return (
    <div className="absolute left-20 top-1/3 opacity-40 pointer-events-none">
      <Stars colors="text-amber-200" count={14} />
      <Stars colors="text-purple-300" count={8} />
      <Stars colors="text-sky-200" count={10} />
      <Stars colors="text-white/70" count={8} />
    </div>
  );
}

// Ensemble d'étoiles multicolores pour la section "Comment ça marche" (droite)
function HowItWorksStarsRight() {
  return (
    <div className="absolute right-20 top-0 bottom-0 w-48 opacity-40 pointer-events-none">
      <Stars colors="text-amber-200" count={10} style={{ right: undefined }} />
      <Stars colors="text-sky-200" count={8} style={{ right: undefined }} />
      <Stars colors="text-purple-300" count={6} style={{ right: undefined }} />
      <Stars colors="text-white/70" count={6} style={{ right: undefined }} />
    </div>
  );
}

// ─── Composant étoiles de fond pour la section équipe ────────────────────────
function TeamStars() {
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }))
  ).current;

  return (
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute text-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: `${s.size}px` }}
        >
          ●
        </div>
      ))}
    </div>
  );
}

// ─── Carte avis ───────────────────────────────────────────────────────────────
const REVIEWS = [
  { initials: 'MC', color: 'bg-blue-100 text-blue-600', name: 'Marie Chevalier', city: 'Bordeaux', text: 'Service impeccable. Le prestataire a été très respectueux et professionnel. Les photos avant/après sont parfaites. Je recommande vivement.' },
  { initials: 'PD', color: 'bg-green-100 text-green-600', name: 'Pierre Dubois', city: 'Paris', text: 'Habitant loin du cimetière familial, ce service est une vraie solution. Transparence totale et qualité irréprochable. Merci Mémoria !' },
  { initials: 'AL', color: 'bg-purple-100 text-purple-600', name: 'Anne Laurent', city: 'Limoges', text: 'Excellent rapport qualité-prix. Le prestataire a même ajouté de jolies fleurs de saison. Un vrai soulagement pour moi.' },
  { initials: 'JM', color: 'bg-orange-100 text-orange-600', name: 'Jacques Martin', city: 'Pau', text: 'Interface simple et claire. Paiement sécurisé. Le travail effectué correspond exactement à mes attentes. Parfait.' },
];

function ReviewCard({ initials, color, name, city, text }) {
  return (
    <div className="flex-shrink-0 w-96 bg-gray-50 rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(4)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 mb-4 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center font-bold`}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{city}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Membre équipe ────────────────────────────────────────────────────────────
const TEAM = [
  { photo: photoPhilippe, name: 'Philippe Lapique', role: 'Fondateur & Développeur', from: 'from-blue-400', to: 'to-blue-600' },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne le paiement ?',
    a: 'Le paiement s\'effectue en ligne via Stripe de manière 100% sécurisée. Le montant est bloqué jusqu\'à validation des photos avant/après par notre équipe.',
  },
  {
    q: 'Qui sont les prestataires ?',
    a: 'Tous nos prestataires sont des professionnels certifiés et vérifiés. Ils sont spécialisés dans l\'entretien de sépultures et interviennent avec respect et dignité. Chaque prestataire est noté par les clients.',
  },
  {
    q: 'Puis-je annuler une commande ?',
    a: 'Oui, vous pouvez annuler gratuitement tant que le prestataire n\'a pas encore accepté la mission. Une fois acceptée, des frais d\'annulation peuvent s\'appliquer selon le délai.',
  },
  {
    q: 'Les photos sont-elles garanties ?',
    a: 'Absolument ! Des photos avant et après sont systématiquement prises par le prestataire. Vous les recevez dans votre espace personnel et vous pouvais laisser un avis sur l\'intervention.',
  },
  {
    q: 'Dans quelles zones intervenez-vous ?',
    a: 'Nous couvrons actuellement toute la région Nouvelle-Aquitaine (Bordeaux, Pau, Limoges, Poitiers...). Notre réseau de prestataires s\'étend progressivement sur tout le territoire français.',
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────
const Home = () => {
  const [ballPosition, setBallPosition] = useState({ top: 150, left: 210 });
  const [sliderPos1, setSliderPos1] = useState(50);
  const [sliderPos2, setSliderPos2] = useState(70);

  // ─── Drag-to-scroll pour la section avis ─────────────────────────────────
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    // Animation des compteurs
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const increment = target / (2000 / 16);
      let current = 0;

      const tick = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && counter.textContent === '0') tick();
        });
      }, { threshold: 0.5 });

      observer.observe(counter);
    });

    // Bille interactive
    const handleMouseMove = (e) => {
      const section = document.querySelector('#comment-ca-marche-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const mouseX = e.clientX - rect.left;
      const sectionHeight = rect.height;

      if (mouseY < 0 || mouseY > sectionHeight || mouseX < 0 || mouseX > rect.width) return;

      const startY = 150;
      const verticalLineH = sectionHeight - 92;
      const horizontalLineY = sectionHeight - 92;

      let newTop, newLeft;

      if (mouseY < startY) {
        newTop = startY;
        newLeft = 210;
      } else if (mouseY < verticalLineH) {
        newTop = Math.max(startY, Math.min(mouseY, verticalLineH));
        newLeft = 210;
      } else if (mouseX < 210) {
        newTop = verticalLineH;
        newLeft = 210;
      } else {
        newTop = horizontalLineY;
        newLeft = Math.max(210, Math.min(mouseX, 550));
        if (mouseY > horizontalLineY + 50) {
          newTop = horizontalLineY + Math.min(mouseY - horizontalLineY, 200);
        }
      }

      setBallPosition({ top: newTop, left: newLeft });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToContent = () => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  const handleSlider = (setter) => (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    setter(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-40">
        <HeroStarsLeft />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 ml-6">
            <p className="text-gray-800 text-4xl font-light tracking-wide">Honorez leur mémoire avec dignité</p>
            <h1 className="text-6xl lg:text-8xl font-serif font-bold leading-tight">
              <span className="whitespace-nowrap">PRENEZ SOIN DE</span>
              <br />
              <span className="whitespace-nowrap bg-green-200 px-2">LEUR REPOS</span>
            </h1>
            <p className="text-gray-600 text-4xl max-w-xl leading-relaxed">
              Confiez l'entretien des sépultures à{' '}
              <span className="bg-blue-200 px-2">des professionnels certifiés.</span>
              <br />
              <span className="whitespace-nowrap">Respect, qualité et transparence garantis.</span>
            </p>
            <div className="flex gap-4 pt-4 relative z-20">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
                Commencer maintenant
              </Link>
              <Link to="/" onClick={() => document.getElementById('comment-ca-marche-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all">
                Découvrir nos services
              </Link>
            </div>
          </div>
        </div>

        {/* Logo décoratif */}
        <div className="absolute top-1/2 -translate-y-1/2 w-1/2 overflow-hidden hidden lg:block pointer-events-none" style={{ right: '-380px' }}>
          <img src={logoMemoria} alt="Logo Mémoria" className="h-[780px] w-auto object-contain" />
        </div>

        {/* Éléphants */}
        <div className="absolute bottom-20 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="h-40 flex items-end justify-start relative">
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-black" />
              <img src={elephants} alt="Silhouettes éléphants" className="w-auto object-contain relative z-10" style={{ height: '700px', marginBottom: '-302px' }} />
            </div>
          </div>
        </div>

        <button onClick={scrollToContent} className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* ── Comment ça marche ────────────────────────────────────────────────── */}
      <section id="comment-ca-marche-section" className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-5xl font-serif font-bold text-center mb-4 text-gray-900">
            <span className="bg-green-200 px-2">Comment ça fonctionne ?</span>
          </h2>
          <p className="text-center text-gray-600 text-lg mb-20">Un parcours simple en 3 étapes</p>

          <div className="space-y-6">
            {[
              {
                num: '1', from: 'from-blue-500', to: 'to-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', checkColor: 'text-blue-600',
                title: 'Choisissez un service',
                desc: 'Sélectionnez le type d\'entretien adapté aux besoins de la sépulture : nettoyage ou fleurissement',
                items: ['Tarifs transparents affichés à l\'avance', 'Paiement sécurisé par Stripe'],
                icon: <img src={iconcommande} alt="Respect" className="w-10 h-10 object-contain" />,
              },
              {
                num: '2', from: 'from-green-500', to: 'to-green-600', iconBg: 'bg-green-100', iconColor: 'text-green-600', checkColor: 'text-green-600',
                title: 'Un prestataire intervient',
                desc: 'Un professionnel qualifié se charge de l\'entretien avec soin et respect, dans votre zone d\'intervention.',
                items: ['Prestataires vérifiés et certifiés', 'Intervention rapide dans votre région'],
                icon: <img src={iconcamion} alt="Respect" className="w-10 h-10 object-contain" />,
              },
              {
                num: '3', from: 'from-blue-500', to: 'to-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', checkColor: 'text-blue-600',
                title: 'Validez le résultat',
                desc: 'Recevez des photos avant/après et validez la prestation réalisée. Votre satisfaction est garantie.',
                items: ['Photos avant/après systématiques', 'Paiement libéré uniquement après validation'],
                icon: <img src={iconconfiance} alt="Respect" className="w-10 h-10 object-contain" />,
              },
            ].map(step => (
              <div key={step.num} className="group relative overflow-hidden rounded-r-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className={`absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-b ${step.from} ${step.to} flex items-center justify-center text-white font-bold text-2xl z-10 group-hover:w-24 transition-all duration-500`}>
                  {step.num}
                </div>
                <div className="ml-20 bg-white p-8 group-hover:ml-24 transition-all duration-500">
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 ${step.iconBg} rounded-xl flex items-center justify-center`}>
                      <div className="w-8 h-8">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">{step.desc}</p>
                      <ul className="space-y-2">
                        {step.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-gray-700">
                            <span className={`${step.checkColor} mt-1`}></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ligne + bille interactive */}
          <div className="absolute bottom-20 left-[230px] pointer-events-none z-20">
            <div className="flex flex-col items-start">
              <div className="w-[4px] h-[920px] bg-black" />
              <div className="w-80 h-[4px] bg-black" />
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
            <Link to="/register" className="inline-block bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
              Commencer maintenant
            </Link>
          </div>
        </div>

        <HowItWorksStarsRight />
      </section>

      {/* ── Statistiques ────────────────────────────────────────────────────── */}
      <section className="w-screen bg-orange-300 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Mémoria en chiffres</h2>
            <p className="text-orange-100 text-lg">La confiance de centaines de familles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                target: 55,
                label: 'Interventions réalisées',
                icon: <img src={iconnettoyage} alt="Nettoyage" className="w-10 h-10 object-contain mx-auto" />,
              },
              {
                target: 15,
                label: 'Prestataires partenaires',
                icon: <img src={iconinspection} alt="Inspection" className="w-10 h-10 object-contain mx-auto" />,
              },
              {
                target: 227,
                label: 'Visites sur le site',
                icon: <img src={iconvisite} alt="Visite" className="w-10 h-10 object-contain mx-auto" />,
              },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:scale-105 transition">
                {/* Conteneur pour l'icône */}
                <div className="w-full flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-5xl font-bold text-white mb-2 counter" data-target={stat.target}>0</div>
                <div className="text-white font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avis clients ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
          </div>

          {/* Défilement infini avec drag-to-scroll */}
          <div
            ref={scrollRef}
            className={`flex gap-6 overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
              } ${!isDragging ? 'animate-scroll' : ''}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Double la liste pour l'effet boucle */}
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ + Avant/Après ───────────────────────────────────────────────── */}
      <section id="faq-section" className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* FAQ */}
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">Questions fréquentes</h2>
              <div className="space-y-4">
                {FAQ_ITEMS.map(item => (
                  <details key={item.q} className="group bg-white rounded-xl shadow-md overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                      <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
                      <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Slider Avant/Après */}
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">
                <span className="bg-blue-200 px-2">Résultats garantis</span>
              </h2>
              <div className="space-y-8">
                {[
                  { before: avantTombe01, after: apresTombe01, label: 'Nettoyage complet — Cimetière de Bordeaux', pos: sliderPos1, setPos: setSliderPos1 },
                  { before: avantTombe02, after: apresTombe02, label: 'Nettoyage complet — Cimetière de Mérignac', pos: sliderPos2, setPos: setSliderPos2 },
                ].map(slider => (
                  <div key={slider.label} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative h-80 group cursor-ew-resize" onMouseMove={handleSlider(slider.setPos)}>
                      <div className="absolute inset-0">
                        <img src={slider.before} alt="Avant" className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">AVANT</div>
                      </div>
                      <div className="absolute inset-0 pointer-events-none" style={{ clipPath: `inset(0 ${100 - slider.pos}% 0 0)` }}>
                        <img src={slider.after} alt="Après" className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">APRÈS</div>
                      </div>
                      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10 pointer-events-none" style={{ left: `${slider.pos}%` }}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                        <p className="text-white text-lg font-semibold">{slider.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Commander un service
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Équipe ──────────────────────────────────────────────────────────── */}
      <section id="team-section" className="bg-black text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Stars colors="text-white/40" count={40} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
                <span className="text-lg font-serif font-bold">M</span>
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase text-gray-400">Mémoria</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>Notre équipe</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Des professionnels passionnés au service de votre sérénité</p>
          </div>

          {/* Contenu principal : une image à gauche, texte à droite */}
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="relative w-full lg:w-1/2 h-[400px] overflow-hidden rounded-lg flex items-center justify-center">
              <img
                src={photoPhilippe}
                alt="Philippe Lapique, Fondateur & Développeur"
                className="relative max-w-full max-h-full object-contain"
              />
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold">Philippe Lapique</h3>
              <p className="text-gray-300 text-lg">Fondateur & Développeur</p>
              <p className="text-gray-400 leading-relaxed">
                Philippe a fondé Mémoria avec la conviction que la technologie peut servir à préserver la mémoire et le respect des défunts.
                Passionné par l'innovation et le service aux familles, il veille à ce que chaque fonctionnalité de la plateforme réponde à un besoin humain et pratique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Home;
import { Link } from 'react-router-dom';
import logoMemoria from '../assets/Logos_Mémoria-remove.png';
import transition from '../assets/transition.png';
import iconRespect from '../assets/Respect.png';
import iconConfiance from '../assets/Confiance.gif';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Composant étoiles (réutilisé)
function Stars({ colors, count, style = {} }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={style}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${colors} opacity-70 animate-twinkle`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '1px',
            height: '1px',
            boxShadow: `0 0 ${Math.random() * 3 + 1}px ${Math.random() * 2 + 1}px currentColor`,
          }}
        />
      ))}
    </div>
  );
}

// Étoiles pour la section "Notre histoire"
function AboutStars() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Stars colors="text-white/60" count={40} />
    </div>
  );
}

const TEAM = [
  { photo: transition, name: 'Philippe Lapique', role: 'Fondateur & Développeur', from: 'from-blue-500', to: 'to-blue-700' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      {/* Hero section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20 pb-12 bg-gray-900 text-white">
        <AboutStars />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
            <span className=" text-white px-3 py-1 rounded-md">Notre mission</span><br />
            Prendre soin de leurs repos avec respect
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Nous accompagnons les familles dans l’entretien des sépultures, avec dignité et transparence.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md">Notre histoire</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Mémoria est né en 2026 d'une réalité que beaucoup connaissent : la distance, le temps, ou simplement la vie, nous éloignent parfois des lieux où reposent ceux que l'on aime. Pourtant, entretenir une sépulture, c'est continuer à honorer leur mémoire.<br></br>
              Face à ce constat, nous avons imaginé une plateforme simple et humaine, qui connecte les familles à des prestataires certifiés, capables d'intervenir avec soin, respect et professionnalisme. <br></br>
              Chaque mission est suivie, photographiée et validée — pour que vous puissiez être serein, où que vous soyez.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Aujourd'hui, Mémoria couvre la Nouvelle-Aquitaine et grandit chaque mois. Notre ambition reste la même : rendre ce geste d'amour accessible à tous.
            </p>
          </div>
          <div className="relative bg-white p-6 rounded-xl shadow-sm">
            <img
              src={logoMemoria}
              alt="Logo Mémoria"
              className="w-full max-w-md mx-auto object-contain opacity-90"
            />
          </div>
        </div>
      </section>


      {/* Valeurs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-16">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md">Nos valeurs</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Respect",
                desc: "Chaque intervention est réalisée avec dignité et considération pour les défunts et leurs familles.",
                icon: <img src={iconRespect} alt="Respect" className="w-10 h-10 object-contain" />,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Transparence",
                desc: "Photos avant/après, tarifs clairs, et suivi en temps réel pour une confiance totale.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                title: "Professionnalisme",
                desc: "Nos prestataires sont formés, certifiés et évalués après chaque intervention.",
                icon: <img src={iconConfiance} alt="Respect" className="w-10 h-10 object-contain" />,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className={`w-16 h-16 ${value.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <div className={value.color}>{value.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Équipe */}
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
            <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>Notre parcours</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Mémoria est avant tout un projet humain. Né dans le cadre d'un projet de fin de scolarité en développement web, il porte dès le départ une vraie conviction : <br></br>
              La technologie peut servir des causes profondes, et pas seulement pratiques.</p>
          </div>

          {/* Contenu principal : une image à gauche, texte à droite */}
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="relative w-full lg:w-1/2 h-[400px] overflow-hidden rounded-lg flex items-center justify-center">
              <img
                src={transition}
                alt="Philippe Lapique, Fondateur & Développeur"
                className="relative max-w-full max-h-full object-contain"
              />
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold">Philippe Lapique</h3>
              <p className="text-gray-300 text-lg">Fondateur & Développeur</p>
              <p className="text-gray-400 leading-relaxed">
                Étudiant en fin de formation en développement web et applications, Philippe a mené Mémoria de la conception à la mise en production : architecture base de données, développement backend et frontend, intégration de paiement, gestion des rôles et des workflows métier.<br></br>
                Curieux, autonome et rigoureux, il aborde chaque projet avec le souci du détail et une vraie sensibilité pour l'expérience utilisateur.<br></br> Mémoria reflète sa capacité à porter un projet complet de bout en bout</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-serif text-xl mb-4">Mémoria</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Entretien de sépultures avec respect et professionnalisme</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/services" className="hover:text-white transition">Nettoyage de tombes</Link></li>
              <li><Link to="/services" className="hover:text-white transition">Fleurissement</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/a-propos" className="hover:text-white transition">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><span className="text-gray-500 cursor-default">Mentions légales</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400">contact@memoria.fr<br />Bordeaux, France</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 Mémoria. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

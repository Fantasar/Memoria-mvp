import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Services = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20 pb-12 bg-gradient-to-b from-green-50 to-green-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
            <span className="bg-green-200 px-2">Nos services</span><br />
            d'entretien de sépultures
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Mémoria vous connecte à des prestataires certifiés pour un entretien respectueux et transparent.
            Nous prélevons une commission de <strong>20%</strong> pour garantir la qualité du service et la sécurité des transactions.
          </p>
        </div>
      </section>

      {/* Tableau des forfaits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">
            <span className="bg-green-200 px-2">Nos forfaits</span>
          </h2>

          {/* Nettoyage */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-200 pb-2 inline-block">
               Nettoyage des pierres tombales
            </h3>
            <p className="text-gray-600 mb-8">
              Nettoyage complet de la pierre tombale avec produits adaptés, disponible en prestation unique ou en formule d'entretien régulier.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestation</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix TTC</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { name: "Nettoyage pierre tombale", description: "Nettoyage complet de la pierre tombale avec produits adaptés", price: "45,00€" },
                    { name: "Entretien Trimestriel", description: "Nettoyage complet tous les 3 mois", price: "110,00€" },
                    { name: "Entretien Semestriel", description: "Nettoyage complet tous les 6 mois", price: "200,00€" },
                    { name: "Entretien Annuel", description: "Nettoyage complet une fois par an", price: "350,00€" },
                    { name: "Abonnement Mensuel Entretien", description: "Nettoyage mensuel", price: "40,00€ / mois" },
                  ].map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{item.description}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-gray-900">{item.price}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                        <Link
                          to="/register"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          Réserver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-sm mt-4 italic">
              * Prix indicatifs pour une tombe standard. Un devis personnalisé sera établi pour les monuments complexes.
            </p>
          </div>

          {/* Livraison de fleurs */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-200 pb-2 inline-block">
               Livraison de fleurs
            </h3>
            <p className="text-gray-600 mb-8">
              Fleurissement saisonnier avec des fleurs fraîches ou artificielles, livrées et installées par nos prestataires.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestation</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix TTC</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { name: "Bouquet Saisonnier", description: "Bouquet de fleurs de saison fraîches", price: "35,00€" },
                    { name: "Composition Artificielle", description: "Composition florale artificielle durable", price: "45,00€" },
                    { name: "Abonnement Mensuel Fleurs", description: "Dépôt mensuel de fleurs fraîches", price: "28,00€ / mois" },
                  ].map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{item.description}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-gray-900">{item.price}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                        <Link
                          to="/register"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          Réserver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Explication du système */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-8">
            <span className="bg-blue-200 px-2">Comment ça fonctionne ?</span>
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md space-y-4">
            <p className="text-gray-700 text-lg leading-relaxed">
              Chez Mémoria, nous sélectionnons rigoureusement nos prestataires :
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700 text-lg">
              <li><strong>Certifiés et formés</strong> : Chaque intervenant est vérifié et évalué après chaque mission.</li>
              <li><strong>Transparence totale</strong> : Vous payez le prix affiché, nous prélevons 20% pour couvrir les frais de plateforme.</li>
              <li><strong>Photos avant/après</strong> : Validation obligatoire de notre équipe avant paiement au prestataire.</li>
            </ul>
            <p className="text-gray-700 text-lg leading-relaxed">
              Notre mission : vous offrir une sérénité totale, où que vous soyez.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
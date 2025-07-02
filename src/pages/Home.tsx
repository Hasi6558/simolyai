import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      
      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Ottimizza il tuo business con l'intelligenza artificiale
          </h1>
          <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
            Rispondi a semplici domande e ottieni un report personalizzato per migliorare la tua azienda, creato con tecnologia AI avanzata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button className="text-lg px-8 py-6 rounded-full bg-purple-600 hover:bg-purple-700">
                Inizia ora
              </Button>
            </Link>
            <Link to="/guide">
              <Button variant="outline" className="text-lg px-8 py-6 rounded-full">
                Scopri di più
              </Button>
            </Link>
            <Link to="/form-preview/free-test">
              <Button variant="secondary" className="text-lg px-8 py-6 rounded-full">
                Fai un breve test gratuito
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Come funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Rispondi al questionario",
                description: "Compila un semplice questionario con domande sulla tua attività",
                icon: "📝"
              },
              {
                title: "Analisi AI",
                description: "Il nostro sistema analizza le tue risposte e genera un report personalizzato",
                icon: "🤖"
              },
              {
                title: "Ottieni risultati",
                description: "Ricevi consigli pratici e strategie per migliorare la tua azienda",
                icon: "📈"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a trasformare la tua azienda?</h2>
          <p className="text-xl mb-8 text-gray-700">
            Scegli il piano più adatto alle tue esigenze e inizia oggi stesso.
          </p>
          <Link to="/pricing">
            <Button className="text-lg px-8 py-6 rounded-full bg-purple-600 hover:bg-purple-700">
              Visualizza i piani
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;


import React from 'react';
import Navbar from '@/components/Navbar';

const Guide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-16 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Guida all'utilizzo</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ecco come ottenere il massimo dalla nostra piattaforma di analisi basata su AI.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Come funziona</h2>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <ol className="space-y-6">
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Scegli il piano adatto a te</h3>
                      <p className="text-gray-600">Inizia selezionando il piano che meglio si adatta alle tue esigenze aziendali.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Rispondi al questionario</h3>
                      <p className="text-gray-600">Compila il questionario con informazioni sulla tua attività. Più dettagli fornisci, più preciso sarà il report.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Ricevi il tuo report personalizzato</h3>
                      <p className="text-gray-600">La nostra IA analizzerà le tue risposte e preparerà un report dettagliato con suggerimenti specifici.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">4</span>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Implementa le strategie suggerite</h3>
                      <p className="text-gray-600">Utilizza i consigli pratici nel report per migliorare la tua attività e monitorare i progressi.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Domande frequenti</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Quanto tempo richiede la compilazione del questionario?</h3>
                  <p className="text-gray-600">Il questionario richiede circa 15-20 minuti per essere compilato in modo completo.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Posso modificare le mie risposte dopo aver inviato il questionario?</h3>
                  <p className="text-gray-600">Sì, puoi tornare e modificare le tue risposte prima di generare il report finale.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Come viene generato il report?</h3>
                  <p className="text-gray-600">Il report viene generato utilizzando algoritmi di intelligenza artificiale avanzati che analizzano le tue risposte e le confrontano con best practices di settore.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <h2 className="text-2xl font-semibold mb-4">Hai ancora domande?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Il nostro team è a tua disposizione per aiutarti in ogni fase del processo.
              </p>
              <a href="/contact" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-full transition-colors">
                Contattaci
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;


import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PricingTable from '@/components/PricingTable';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('sort_order', { ascending: true })
          .eq('active', true);

        if (error) {
          console.error('Error fetching plans:', error);
          return;
        }

        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-16 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Scegli il piano più adatto a te</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Offriamo diverse soluzioni per soddisfare le tue esigenze, dal piccolo imprenditore alla grande azienda.
                </p>
              </div>
              
              <PricingTable />
              
              <div className="mt-20 text-center">
                <h2 className="text-2xl font-semibold mb-6">Domande frequenti sui prezzi</h2>
                <div className="max-w-3xl mx-auto grid gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-medium text-lg mb-2">Ci sono costi nascosti?</h3>
                    <p className="text-gray-600">No, il prezzo indicato è quello definitivo. Non ci sono costi aggiuntivi o nascosti.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-medium text-lg mb-2">Posso cambiare piano in futuro?</h3>
                    <p className="text-gray-600">Certamente! Puoi passare a un piano superiore in qualsiasi momento.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-medium text-lg mb-2">È previsto un rimborso se non sono soddisfatto?</h3>
                    <p className="text-gray-600">Sì, offriamo una garanzia di rimborso di 14 giorni se non sei completamente soddisfatto del servizio.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

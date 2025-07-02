import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Check, Clock, CreditCard, Lock, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPlanFree, setIsPlanFree] = useState(false);
  const [planName, setPlanName] = useState('');
  
  const searchParams = new URLSearchParams(location.search);
  const selectedPlanId = searchParams.get('plan') || '';
  const selectedPlanPrice = parseInt(searchParams.get('price') || '0');
  
  useEffect(() => {
    const checkPlanType = async () => {
      if (selectedPlanId) {
        try {
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', selectedPlanId)
            .single();

          if (error) {
            console.error('Error fetching plan details:', error);
            return;
          }

          if (data) {
            setPlanName(data.name);
            
            if (data.is_free === true) {
              setIsPlanFree(true);
              toast({
                title: 'Piano Gratuito Attivato!',
                description: `Hai attivato con successo il piano gratuito ${data.name}.`,
              });
              
              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
            }
          }
        } catch (error) {
          console.error('Error checking plan type:', error);
        }
      }
    };

    checkPlanType();
  }, [selectedPlanId, navigate, toast]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Pagamento completato!',
        description: `Hai attivato con successo il piano ${planName}.`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      toast({
        variant: 'destructive',
        title: 'Errore di pagamento',
        description: 'Si è verificato un errore durante il pagamento. Riprova.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPlanFree) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12 px-4 bg-gradient-to-b from-white to-purple-50">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Piano Gratuito Attivato</CardTitle>
              <CardDescription>
                Il tuo piano gratuito {planName} è stato attivato con successo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
              <p className="text-gray-600">
                Stai per essere reindirizzato alla tua dashboard personale...
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Vai alla Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Completa il tuo acquisto</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Metodo di pagamento</CardTitle>
                  <CardDescription>Scegli come vuoi pagare</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="card" onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card">Carta di credito</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="card">
                      <form onSubmit={handlePayment} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Nome sulla carta</Label>
                          <Input id="cardName" placeholder="Mario Rossi" required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Numero carta</Label>
                          <div className="relative">
                            <Input 
                              id="cardNumber" 
                              placeholder="1234 5678 9012 3456" 
                              required 
                              maxLength={19}
                              pattern="[0-9 ]+"
                            />
                            <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Scadenza</Label>
                            <div className="relative">
                              <Input 
                                id="expiryDate" 
                                placeholder="MM/AA" 
                                required 
                                maxLength={5}
                                pattern="[0-9/]+"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <div className="relative">
                              <Input 
                                id="cvv" 
                                placeholder="123" 
                                required 
                                maxLength={4}
                                pattern="[0-9]+"
                                type="password"
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-purple-600 hover:bg-purple-700 mt-4" 
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Elaborazione...' : `Paga €${(selectedPlanPrice / 100).toFixed(2)}`}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="paypal">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-xl mb-4">
                          Pay<span className="text-blue-300">Pal</span>
                        </div>
                        <p className="text-center text-gray-600 mb-6">
                          Sarai reindirizzato al sito PayPal per completare il pagamento in modo sicuro.
                        </p>
                        <Button 
                          onClick={handlePayment} 
                          className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Elaborazione...' : `Continua con PayPal`}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                
                <CardFooter>
                  <div className="w-full flex items-center justify-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" /> I tuoi dati di pagamento sono protetti e criptati
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Riepilogo ordine</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Piano</span>
                      <span>{planName || 'Piano selezionato'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Prezzo</span>
                      <span className="font-bold">€{(selectedPlanPrice / 100).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">IVA (22%)</span>
                      <span>Inclusa</span>
                    </div>
                    
                    <div className="border-t pt-4 flex justify-between">
                      <span className="font-bold">Totale</span>
                      <span className="font-bold">€{(selectedPlanPrice / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <span>Fattura digitale inviata via email</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <span>Assistenza prioritaria</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <span>Garanzia soddisfatti o rimborsati di 14 giorni</span>
                    </li>
                  </ul>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

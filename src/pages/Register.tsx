import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
  lastName: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido' }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: 'La password deve contenere almeno 6 caratteri' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanFree, setIsPlanFree] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const selectedPlanId = searchParams.get('plan') || '';
  const selectedPlanPrice = searchParams.get('price') || '0';
  const [planDetails, setPlanDetails] = useState({
    name: 'Piano',
    price: parseInt(selectedPlanPrice || '0'),
  });

  useEffect(() => {
    const fetchPlanDetails = async () => {
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
            setPlanDetails({
              name: data.name,
              price: data.price,
            });
            setIsPlanFree(Boolean(data.is_free));
          }
        } catch (error) {
          console.error('Error fetching plan details:', error);
        }
      }
    };

    fetchPlanDetails();
  }, [selectedPlanId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            subscription_plan: selectedPlanId,
            phone: values.phone || null,
          }
        }
      });
      
      if (authError) throw authError;
      
      toast({
        title: 'Registrazione completata!',
        description: "Ti abbiamo inviato un'email di conferma.",
      });
      
      if (isPlanFree) {
        navigate('/pricing');
      } else {
        navigate('/pricing');
      }
      
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      toast({
        variant: 'destructive',
        title: 'Errore di registrazione',
        description: error.message || 'Si è verificato un errore durante la registrazione. Riprova.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handler
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Errore di accesso',
        description: error.message || 'Si è verificato un errore durante il login social. Riprova.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-b from-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
            <CardDescription>
              {selectedPlanId ? (
                <>
                  Hai selezionato il piano <strong>{planDetails.name}</strong>
                  {!isPlanFree && ` - €${(planDetails.price / 100).toFixed(2)}`}
                </>
              ) : 'Completa la registrazione per continuare'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Mario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognome</FormLabel>
                        <FormControl>
                          <Input placeholder="Rossi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nome@esempio.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono <span className="text-xs text-gray-500">(opzionale)</span></FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+39 123 456 7890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Utile per notifiche SMS o WhatsApp se previste dal tuo piano.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="absolute top-0 right-0 h-full px-3" 
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="absolute top-0 right-0 h-full px-3" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrazione in corso...
                    </>
                  ) : (
                    <>
                      {isPlanFree ? (
                        <span>Registrati e inizia subito</span>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Registrati e procedi al pagamento
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <div className="flex flex-col gap-2 mb-4 px-4">
            <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center py-3" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
              <FcGoogle className="h-5 w-5" />
              Continua con Google
            </Button>
            <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center py-3" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}>
              <FaFacebook className="h-5 w-5 text-blue-600" />
              Continua con Facebook
            </Button>
          </div>
          
          <CardFooter className="flex flex-col space-y-2 items-center">
            <p className="text-sm text-gray-500">
              Hai già un account? <a href="/login" className="text-purple-600 hover:text-purple-800">Accedi</a>
            </p>
            <p className="text-xs text-gray-400 text-center">
              Registrandoti accetti i nostri <a href="/terms-of-service" className="text-purple-600 hover:text-purple-800">Termini di Servizio</a> e la <a href="/privacy-policy" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;

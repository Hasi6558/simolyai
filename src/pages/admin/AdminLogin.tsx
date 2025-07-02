
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Credenziali predefinite (usate solo per pre-riempire il campo email)
const DEFAULT_ADMIN_EMAIL = 'admin@simpolyai.com';

// Form schema con validazione
const formSchema = z.object({
  email: z.string()
    .email({
      message: "Inserisci un indirizzo email valido.",
    }),
  password: z.string().min(6, {
    message: "La password deve essere lunga almeno 6 caratteri.",
  }),
});

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Se già loggato, reindirizza alla dashboard admin
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Inizializza il form con l'email predefinita per facilitare il login
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: DEFAULT_ADMIN_EMAIL,
      password: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setError('');
      
      // Rimuovi spazi bianchi dai valori di input
      const trimmedEmail = values.email.trim();
      const trimmedPassword = values.password.trim();
      
      console.log('Tentativo di accesso con:', trimmedEmail);
      
      // Usa signInWithPassword per il login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      
      if (loginError) {
        console.error('Errore durante il login:', loginError);
        throw loginError;
      }
      
      console.log('Login avvenuto con successo:', data);
      
      toast({
        title: 'Login avvenuto con successo',
        description: 'Benvenuto nel pannello di amministrazione',
      });
      
      navigate('/admin');
      
    } catch (error) {
      console.error('Errore di login:', error);
      
      // Gestione personalizzata degli errori
      if (error.message?.includes('Invalid login credentials')) {
        setError('Credenziali non valide. Contattare l\'amministratore di sistema.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Email non confermata. Contattare l\'amministratore di sistema.');
      } else {
        setError(`Errore durante il login: ${error.message || 'Errore sconosciuto'}`);
      }
      
      toast({
        title: 'Errore di accesso',
        description: 'Verifica le credenziali di amministratore',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">SimpolyAI Admin</CardTitle>
          <CardDescription>
            Accedi al pannello di amministrazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email amministratore" 
                        {...field} 
                      />
                    </FormControl>
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
                      <Input 
                        type="password" 
                        placeholder="Password amministratore" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600">
          <p>
            Utilizza le credenziali di amministratore fornite dal sistema.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;

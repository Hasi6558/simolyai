
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/supabase';

type ExtendedProfile = Profile & { 
  email: string; 
  last_sign_in_at: string | null;
};

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    fiscal_code: '',
    subscription_plan: '',
    subscription_expiry: ''
  });

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
      if (authError) throw authError;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      const updatedAt = profile?.updated_at || new Date().toISOString();
      
      const combinedData: ExtendedProfile = {
        id: authUser?.user?.id || '',
        email: authUser?.user?.email || '',
        created_at: authUser?.user?.created_at || '',
        updated_at: updatedAt,
        last_sign_in_at: authUser?.user?.last_sign_in_at,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        phone: profile?.phone || null,
        address: profile?.address || null,
        fiscal_code: profile?.fiscal_code || null,
        subscription_plan: profile?.subscription_plan || null,
        subscription_expiry: profile?.subscription_expiry || null,
        role: (profile?.role as 'user' | 'admin') || 'user'
      };
      
      setCustomer(combinedData);
      setFormData({
        first_name: combinedData.first_name || '',
        last_name: combinedData.last_name || '',
        email: combinedData.email,
        phone: combinedData.phone || '',
        address: combinedData.address || '',
        fiscal_code: combinedData.fiscal_code || '',
        subscription_plan: combinedData.subscription_plan || '',
        subscription_expiry: combinedData.subscription_expiry ? new Date(combinedData.subscription_expiry).toISOString().split('T')[0] : ''
      });
      
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dettagli del cliente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveChanges = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          fiscal_code: formData.fiscal_code,
          subscription_plan: formData.subscription_plan,
          subscription_expiry: formData.subscription_expiry
        });
      
      if (profileError) throw profileError;
      
      toast({
        title: 'Salvato',
        description: 'Dettagli cliente salvati con successo.',
      });
      
      fetchCustomerDetails();
    } catch (error) {
      console.error('Error saving customer details:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dettagli del cliente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-10">Caricamento...</div>;
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla lista
          </Button>
        </div>
        <Card>
          <CardContent className="flex justify-center p-10">
            Cliente non trovato
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptionBadgeVariant = 
    !formData.subscription_plan ? 'outline' : 
    (new Date(formData.subscription_expiry ?? '') > new Date()) ? 'default' : 'destructive';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla lista
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Dettagli Cliente</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Abbonamento
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Form Compilati
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Profilo</CardTitle>
              <CardDescription>
                Gestisci i dettagli personali del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {formData.first_name || formData.last_name 
                      ? `${formData.first_name} ${formData.last_name}`
                      : 'Cliente'}
                  </h3>
                  <p className="text-muted-foreground">{formData.email}</p>
                </div>
                <div>
                  <Badge variant="outline">ID: {customer.id.substring(0, 8)}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Cognome</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal_code">Codice Fiscale</Label>
                  <Input
                    id="fiscal_code"
                    name="fiscal_code"
                    value={formData.fiscal_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Informazioni Account</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Registrazione:</p>
                    <p>{formatDate(customer.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ultimo accesso:</p>
                    <p>{formatDate(customer.last_sign_in_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges} disabled={saving} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Abbonamento</CardTitle>
              <CardDescription>
                Gestisci i dettagli dell'abbonamento del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription_plan">Piano</Label>
                  <Input
                    id="subscription_plan"
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_expiry">Scadenza</Label>
                  <Input
                    id="subscription_expiry"
                    name="subscription_expiry"
                    type="date"
                    value={formData.subscription_expiry}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Stato Abbonamento</h4>
                <Badge variant={subscriptionBadgeVariant}>
                  {!formData.subscription_plan ? 'Nessun piano' : 
                   new Date(formData.subscription_expiry) > new Date() ? 'Attivo' : 'Scaduto'}
                </Badge>
                {formData.subscription_plan && (
                  <p className="text-sm mt-2">
                    {new Date(formData.subscription_expiry) > new Date() 
                      ? `Scade il ${formatDate(formData.subscription_expiry)}` 
                      : `Scaduto il ${formatDate(formData.subscription_expiry)}`}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges} disabled={saving} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form Compilati</CardTitle>
              <CardDescription>
                Visualizza i form compilati da questo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Funzionalità in sviluppo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;

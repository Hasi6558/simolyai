
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase, saveAppSettings } from '@/integrations/supabase/client';
import { ColorPicker } from '@/components/admin/ColorPicker';
import { Loader2 } from 'lucide-react';

// Define schema for form validation
const generalSettingsSchema = z.object({
  siteName: z.string().min(2, { message: 'Il nome del sito è obbligatorio' }),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email({ message: 'Inserisci un indirizzo email valido' }),
  enableRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  maxStoragePerUser: z.number().min(1, { message: 'Specificare un valore maggiore di 0' }),
  primaryColor: z.string().default('#9b87f5'),
  secondaryColor: z.string().default('#7E69AB'),
  accentColor: z.string().default('#E5DEFF'),
  fontFamily: z.string().default('poppins'),
  fontSize: z.string().default('medium'),
  buttonStyle: z.string().default('rounded'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  siteUrl: z.string().optional(),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('general');

  // Initialize form with react-hook-form
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: 'SimolyAI',
      siteDescription: 'Piattaforma di analisi con AI',
      contactEmail: 'info@simolyai.com',
      enableRegistration: true,
      requireEmailVerification: true,
      maxStoragePerUser: 100,
      primaryColor: '#9b87f5',
      secondaryColor: '#7E69AB',
      accentColor: '#E5DEFF',
      fontFamily: 'poppins',
      fontSize: 'medium',
      buttonStyle: 'rounded',
      logo: '',
      favicon: '',
      siteUrl: '',
    },
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (error) {
          console.error("Error fetching settings:", error);
          return;
        }

        if (data) {
          // Update form with fetched settings
          form.reset({
            siteName: data.site_name || 'SimolyAI',
            siteDescription: data.site_description || 'Piattaforma di analisi con AI',
            contactEmail: data.contact_email || 'info@simolyai.com',
            enableRegistration: data.enable_registration !== undefined ? data.enable_registration : true,
            requireEmailVerification: data.require_email_verification !== undefined ? data.require_email_verification : true,
            maxStoragePerUser: data.max_storage_per_user || 100,
            primaryColor: data.primary_color || '#9b87f5',
            secondaryColor: data.secondary_color || '#7E69AB',
            accentColor: data.accent_color || '#E5DEFF',
            fontFamily: data.font_family || 'poppins',
            fontSize: data.font_size || 'medium',
            buttonStyle: data.button_style || 'rounded',
            logo: data.logo || '',
            favicon: data.favicon || '',
            siteUrl: data.site_url || '',
          });

          // Set logo URL if available
          if (data.logo) {
            setLogoUrl(data.logo);
          }
          
          // Set favicon URL if available
          if (data.favicon) {
            setFaviconUrl(data.favicon);
          }
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
      }
    };

    fetchAppSettings();
  }, [form]);

  const handleLogoUpload = (imageUrl: string) => {
    form.setValue('logo', imageUrl);
    setLogoUrl(imageUrl);
  };
  
  const handleFaviconUpload = (imageUrl: string) => {
    form.setValue('favicon', imageUrl);
    setFaviconUrl(imageUrl);
  };

  // Save settings
  const onSubmit = async (data: GeneralSettingsFormValues) => {
    setSaving(true);
    
    try {
      console.log("Saving settings:", data);
      const result = await saveAppSettings(data);
      
      if (!result.success) {
        throw result.error;
      }

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni sono state aggiornate con successo",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio delle impostazioni",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const [paymentSettings, setPaymentSettings] = useState({
    enablePayments: true,
    currency: 'EUR',
    vatPercentage: 22,
    stripePublicKey: '',
    stripeSecretKey: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    sendWelcomeEmail: true,
    sendCompletionEmail: true,
    sendReportEmail: true,
    adminNotifyNewUser: true,
  });

  const handleSavePaymentSettings = () => {
    setSaving(true);
    
    // Simula salvataggio
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni di pagamento sono state aggiornate con successo.",
      });
    }, 1000);
  };
  
  const handleSaveNotificationSettings = () => {
    setSaving(true);
    
    // Simula salvataggio
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni di notifica sono state aggiornate con successo.",
      });
    }, 1000);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci le impostazioni di sistema della piattaforma
        </p>
      </div>
      
      <Tabs defaultValue="general" value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general">Generali</TabsTrigger>
          <TabsTrigger value="appearance">Aspetto</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
              <CardDescription>
                Configura le impostazioni di base della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="generalForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome del Sito</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome del sito" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="siteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL del Sito</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.tuosito.it" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descrizione del sito"
                              {...field}
                              className="min-h-[100px]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email di Contatto</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contatto@esempio.it" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel>Logo del Sito</FormLabel>
                      <div className="mt-2">
                        {logoUrl && (
                          <div className="mb-4">
                            <img 
                              src={logoUrl} 
                              alt="Logo del sito" 
                              className="h-16 object-contain"
                            />
                          </div>
                        )}
                        <ImageUploader 
                          onImageUpload={handleLogoUpload}
                          label="Logo"
                          buttonText="Carica logo del sito"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel>Favicon</FormLabel>
                      <div className="mt-2">
                        {faviconUrl && (
                          <div className="mb-4">
                            <img 
                              src={faviconUrl} 
                              alt="Favicon del sito" 
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                        )}
                        <ImageUploader 
                          onImageUpload={handleFaviconUpload}
                          label="Favicon"
                          buttonText="Carica favicon (PNG/JPG consigliato)"
                          accept="image/png,image/jpeg,image/svg+xml"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Nota: Utilizzare un'immagine quadrata per risultati migliori. PNG/JPG consigliato.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="enableRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Abilita Registrazione</FormLabel>
                              <FormDescription>
                                Consenti agli utenti di registrarsi sul sito
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="requireEmailVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Richiedi Verifica Email</FormLabel>
                              <FormDescription>
                                Richiedi agli utenti di verificare la loro email prima di accedere
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="maxStoragePerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Massimo per Utente (MB)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      'Salva Impostazioni'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aspetto e Design</CardTitle>
              <CardDescription>
                Personalizza l'aspetto visivo dell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="appearanceForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Colori</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colore Primario</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <ColorPicker
                                  color={field.value}
                                  onChange={field.onChange}
                                />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <div 
                              className="h-8 w-full rounded-md mt-2" 
                              style={{ backgroundColor: field.value }}
                            ></div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colore Secondario</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <ColorPicker
                                  color={field.value}
                                  onChange={field.onChange}
                                />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <div 
                              className="h-8 w-full rounded-md mt-2" 
                              style={{ backgroundColor: field.value }}
                            ></div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colore Accent</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <ColorPicker
                                  color={field.value}
                                  onChange={field.onChange}
                                />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <div 
                              className="h-8 w-full rounded-md mt-2" 
                              style={{ backgroundColor: field.value }}
                            ></div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Tipografia</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Famiglia Font</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona un font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="poppins">Poppins</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="lato">Lato</SelectItem>
                                <SelectItem value="montserrat">Montserrat</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Il font principale utilizzato nell'interfaccia
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensione Font</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Dimensione font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Piccolo</SelectItem>
                                <SelectItem value="medium">Medio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Stile UI</h3>
                    
                    <FormField
                      control={form.control}
                      name="buttonStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stile Pulsanti</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona uno stile" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rounded">Arrotondato</SelectItem>
                              <SelectItem value="pill">Pill</SelectItem>
                              <SelectItem value="square">Quadrato</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            La forma dei pulsanti nell'applicazione
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      'Salva Impostazioni'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Pagamenti</CardTitle>
              <CardDescription>
                Configura le opzioni di pagamento e fatturazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-payments">Abilita Pagamenti</Label>
                  <p className="text-sm text-muted-foreground">
                    Attiva il sistema di pagamenti sul sito
                  </p>
                </div>
                <Switch
                  id="enable-payments"
                  checked={paymentSettings.enablePayments}
                  onCheckedChange={(checked) => 
                    setPaymentSettings({...paymentSettings, enablePayments: checked})
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <Input
                  id="currency"
                  value={paymentSettings.currency}
                  onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vat">Percentuale IVA</Label>
                <Input
                  id="vat"
                  type="number"
                  value={paymentSettings.vatPercentage}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings, 
                    vatPercentage: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="stripe-public">Stripe Public Key</Label>
                <Input
                  id="stripe-public"
                  value={paymentSettings.stripePublicKey}
                  onChange={(e) => setPaymentSettings({...paymentSettings, stripePublicKey: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  value={paymentSettings.stripeSecretKey}
                  onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  Non condividere mai questa chiave. Verrà salvata in modo sicuro.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePaymentSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salva Impostazioni'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Notifiche</CardTitle>
              <CardDescription>
                Configura le notifiche email per utenti e amministratori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="welcome-email">Email di Benvenuto</Label>
                    <p className="text-sm text-muted-foreground">
                      Invia un'email di benvenuto ai nuovi utenti
                    </p>
                  </div>
                  <Switch
                    id="welcome-email"
                    checked={notificationSettings.sendWelcomeEmail}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, sendWelcomeEmail: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="completion-email">Email di Completamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Invia un'email quando un questionario viene completato
                    </p>
                  </div>
                  <Switch
                    id="completion-email"
                    checked={notificationSettings.sendCompletionEmail}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, sendCompletionEmail: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="report-email">Email di Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Invia un'email quando un nuovo report è disponibile
                    </p>
                  </div>
                  <Switch
                    id="report-email"
                    checked={notificationSettings.sendReportEmail}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, sendReportEmail: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-notify">Notifiche Admin</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifica gli amministratori quando si registra un nuovo utente
                    </p>
                  </div>
                  <Switch
                    id="admin-notify"
                    checked={notificationSettings.adminNotifyNewUser}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, adminNotifyNewUser: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salva Impostazioni'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

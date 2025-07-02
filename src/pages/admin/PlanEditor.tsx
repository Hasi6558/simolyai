import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Plus, Trash2, Clock, Copy, CheckSquare, RotateCcw, Bell } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { fetchPlan, savePlanSettings } from '@/services/plans';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_free: boolean;
  features: string[];
  options: {
    singleQuestionnaire: boolean;
    verificationAfter: boolean;
    periodicQuestionnaires: boolean;
    multipleQuestionnaires: boolean;
    progressQuestionnaires: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    whatsappNotifications?: boolean;
    verificationPeriod?: number;
    maxRepetitions?: number;
    reminderDaysBefore?: number;
    reminderFrequency?: string;
    reminderMessage?: string;
    reminderCount?: number;
  };
  questionnaires: Array<{
    id: string;
    sequence?: number;
    periodicity?: number;
    repetitions?: number;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PlanEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState([]);

  const [plan, setPlan] = useState<Plan>({
    id: '',
    name: '',
    description: '',
    price: 0,
    is_free: false,
    features: [''],
    options: {
      singleQuestionnaire: true,
      verificationAfter: false,
      periodicQuestionnaires: false,
      multipleQuestionnaires: false,
      progressQuestionnaires: false,
      emailNotifications: true,
      reminderDaysBefore: 7,
      reminderFrequency: 'once',
      reminderMessage: 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.',
      reminderCount: 1
    },
    questionnaires: [],
    isActive: true,
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const { data, error } = await supabase
          .from('questionnaire_config')
          .select('id, title')
          .eq('status', 'published');
          
        if (error) {
          console.error('Error fetching questionnaires:', error);
          return;
        }

        if (data && data.length > 0) {
          setAvailableQuestionnaires(data);
        } else {
          setAvailableQuestionnaires([
            { id: '1', title: 'Valutazione Aziendale' },
            { id: '2', title: 'Analisi Bisogni Formativi' },
            { id: '3', title: 'Soddisfazione Cliente' },
            { id: '4', title: 'Leadership Assessment' },
            { id: '5', title: 'Valutazione Competenze Digitali' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
      }
    };

    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      if (id) {
        try {
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            const features = Array.isArray(data.features) 
              ? data.features 
              : JSON.parse(data.features as string || '[]');
            
            let options = {
              singleQuestionnaire: false,
              verificationAfter: false,
              periodicQuestionnaires: false,
              multipleQuestionnaires: false,
              progressQuestionnaires: false,
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false,
              verificationPeriod: 90,
              maxRepetitions: 4,
              reminderDaysBefore: 7,
              reminderFrequency: 'once',
              reminderMessage: 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.',
              reminderCount: 1
            };
            
            const { data: planSettings } = await supabase
              .from('plan_settings')
              .select('*')
              .eq('plan_id', id)
              .single();
            
            if (planSettings) {
              options = {
                singleQuestionnaire: !planSettings.can_retake && !planSettings.is_sequential && !planSettings.is_progress_tracking && !planSettings.is_periodic,
                verificationAfter: planSettings.can_retake && planSettings.retake_limit === 1,
                periodicQuestionnaires: planSettings.is_periodic,
                multipleQuestionnaires: !planSettings.is_sequential && !planSettings.is_progress_tracking && !planSettings.is_periodic,
                progressQuestionnaires: planSettings.is_progress_tracking || planSettings.is_sequential,
                emailNotifications: true, // Default
                smsNotifications: false,
                whatsappNotifications: false,
                verificationPeriod: planSettings.retake_period_days || 90,
                maxRepetitions: planSettings.retake_limit || 4,
                reminderDaysBefore: 7,
                reminderFrequency: 'once',
                reminderMessage: 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.',
                reminderCount: 1
              };
            }
            
            const { data: questionnaires } = await supabase
              .from('plan_questionnaires')
              .select('*')
              .eq('plan_id', id)
              .order('sequence_order', { ascending: true });
            
            const planQuestionnaires = questionnaires ? questionnaires.map(q => ({
              id: q.questionnaire_id,
              sequence: q.sequence_order,
              periodicity: planSettings?.retake_period_days || 90,
              repetitions: planSettings?.retake_limit || 1
            })) : [];
            
            setPlan({
              id: data.id,
              name: data.name,
              description: data.description || '',
              price: data.price || 0,
              is_free: Boolean(data.is_free),
              features: features,
              options: options,
              questionnaires: planQuestionnaires,
              isActive: data.active,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            });
          }
        } catch (error) {
          console.error("Errore nel caricamento del piano:", error);
          toast({
            title: "Errore",
            description: "Impossibile caricare il piano richiesto",
            variant: "destructive"
          });
          
          setPlan({
            id: id,
            name: 'Piano Premium',
            description: 'Piano avanzato con accesso a tutti i questionari',
            price: 9999,
            is_free: false,
            features: [
              'Accesso a tutti i questionari',
              'Verifiche periodiche',
              'Tracciamento dei progressi',
              'Report personalizzati',
              'Consulenza dedicata'
            ],
            options: {
              singleQuestionnaire: false,
              verificationAfter: false,
              periodicQuestionnaires: true,
              multipleQuestionnaires: true,
              progressQuestionnaires: false,
              verificationPeriod: 90,
              maxRepetitions: 4,
              emailNotifications: true,
              reminderDaysBefore: 7,
              reminderFrequency: 'once',
              reminderMessage: 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.',
              reminderCount: 1
            },
            questionnaires: [
              { id: '1' },
              { id: '2' },
              { id: '3' }
            ],
            isActive: true,
            createdAt: '2023-07-22',
            updatedAt: '2023-08-15'
          });
        }
      } else {
        setPlan({
          id: uuidv4(),
          name: 'Nuovo Piano',
          description: 'Descrizione del nuovo piano',
          price: 0,
          is_free: true,
          features: [''],
          options: {
            singleQuestionnaire: true,
            verificationAfter: false,
            periodicQuestionnaires: false,
            multipleQuestionnaires: false,
            progressQuestionnaires: false,
            emailNotifications: true,
            reminderDaysBefore: 7,
            reminderFrequency: 'once',
            reminderMessage: 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.',
            reminderCount: 1
          },
          questionnaires: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      setIsLoading(false);
    };

    fetchPlan();
  }, [id, toast]);

  const handleBack = () => {
    navigate('/admin/plans');
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // 1. First save the subscription plan
      const planData = {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.is_free ? 0 : plan.price,
        is_free: plan.is_free,
        features: plan.features,
        active: plan.isActive,
        button_text: plan.is_free ? 'Inizia Gratis' : 'Seleziona Piano',
        button_variant: plan.is_free ? 'default' : 'outline',
        sort_order: 0,
        interval: 'month',
        is_popular: false,
        created_at: plan.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: planError } = await supabase
        .from('subscription_plans')
        .upsert(planData);
      
      if (planError) throw planError;
      
      // 2. Save plan settings
      const planSettings = {
        plan_id: plan.id,
        is_free: plan.is_free,
        can_retake: plan.options.verificationAfter || plan.options.periodicQuestionnaires,
        retake_period_days: plan.options.verificationPeriod || 90,
        retake_limit: plan.options.maxRepetitions || (plan.options.verificationAfter ? 1 : 4),
        is_sequential: plan.options.progressQuestionnaires,
        is_progress_tracking: plan.options.progressQuestionnaires,
        is_periodic: plan.options.periodicQuestionnaires
      };
      
      const settingsSuccess = await savePlanSettings(plan.id, planSettings);
      
      if (!settingsSuccess) {
        throw new Error('Failed to save plan settings');
      }
      
      // 3. Delete existing questionnaires for this plan and add new ones
      if (plan.questionnaires.length > 0) {
        // First delete existing entries
        if (id) {
          const { error: deleteError } = await supabase
            .from('plan_questionnaires')
            .delete()
            .eq('plan_id', plan.id);
          
          if (deleteError) throw deleteError;
        }
        
        // Then add all new entries
        const questionnaireData = plan.questionnaires.map((q, index) => ({
          plan_id: plan.id,
          questionnaire_id: q.id,
          sequence_order: plan.options.progressQuestionnaires ? (q.sequence || index + 1) : index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('plan_questionnaires')
          .insert(questionnaireData);
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Piano salvato",
        description: "Il piano è stato salvato con successo"
      });
      
      navigate('/admin/plans');
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = <K extends keyof Plan>(key: K, value: Plan[K]) => {
    setPlan({
      ...plan,
      [key]: value
    });
  };

  const handleOptionChange = <K extends keyof Plan['options']>(key: K, value: any) => {
    setPlan({
      ...plan,
      options: {
        ...plan.options,
        [key]: value
      }
    });
  };

  const addFeature = () => {
    handleChange('features', [...plan.features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...plan.features];
    updatedFeatures[index] = value;
    handleChange('features', updatedFeatures);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = plan.features.filter((_, i) => i !== index);
    handleChange('features', updatedFeatures);
  };

  const addQuestionnaire = () => {
    if (plan.options.singleQuestionnaire && plan.questionnaires.length > 0) {
      toast({
        title: "Avviso",
        description: "Il piano con questionario singolo può avere un solo questionario",
        variant: "default"
      });
      return;
    }
    
    const availableIds = availableQuestionnaires.map(q => q.id);
    const usedIds = plan.questionnaires.map(q => q.id);
    const unusedIds = availableIds.filter(id => !usedIds.includes(id));
    
    if (unusedIds.length > 0) {
      const newQuestionnaire = {
        id: unusedIds[0],
        sequence: plan.options.progressQuestionnaires ? plan.questionnaires.length + 1 : undefined,
        periodicity: plan.options.periodicQuestionnaires ? 90 : undefined,
        repetitions: plan.options.periodicQuestionnaires || plan.options.verificationAfter ? 1 : undefined
      };
      
      handleChange('questionnaires', [...plan.questionnaires, newQuestionnaire]);
    } else {
      toast({
        title: "Attenzione",
        description: "Tutti i questionari disponibili sono già stati aggiunti",
        variant: "destructive"
      });
    }
  };

  const removeQuestionnaire = (index: number) => {
    const updatedQuestionnaires = plan.questionnaires.filter((_, i) => i !== index);
    
    if (plan.options.progressQuestionnaires) {
      updatedQuestionnaires.forEach((q, i) => {
        q.sequence = i + 1;
      });
    }
    
    handleChange('questionnaires', updatedQuestionnaires);
  };

  const updateQuestionnaire = (index: number, key: keyof typeof plan.questionnaires[0], value: any) => {
    const updatedQuestionnaires = [...plan.questionnaires];
    updatedQuestionnaires[index] = {
      ...updatedQuestionnaires[index],
      [key]: value
    };
    
    handleChange('questionnaires', updatedQuestionnaires);
  };

  const getQuestionnaireTitle = (id: string) => {
    const questionnaire = availableQuestionnaires.find(q => q.id === id);
    return questionnaire ? questionnaire.title : 'Questionario non trovato';
  };

  const handlePlanTypeChange = (type: string) => {
    let newOptions = {
      ...plan.options,
      singleQuestionnaire: false,
      verificationAfter: false,
      periodicQuestionnaires: false,
      multipleQuestionnaires: false,
      progressQuestionnaires: false,
    };
    
    switch (type) {
      case 'single':
        newOptions.singleQuestionnaire = true;
        break;
      case 'verification':
        newOptions.verificationAfter = true;
        newOptions.verificationPeriod = 90;
        break;
      case 'periodic':
        newOptions.periodicQuestionnaires = true;
        newOptions.maxRepetitions = 4;
        break;
      case 'multiple':
        newOptions.multipleQuestionnaires = true;
        break;
      case 'progress':
        newOptions.progressQuestionnaires = true;
        break;
    }
    
    let updatedQuestionnaires = [...plan.questionnaires];
    
    if (newOptions.singleQuestionnaire && updatedQuestionnaires.length > 1) {
      updatedQuestionnaires = [updatedQuestionnaires[0]];
      toast({
        title: "Avviso",
        description: "Il piano con questionario singolo può avere un solo questionario. Gli altri questionari sono stati rimossi.",
      });
    }
    
    if (newOptions.progressQuestionnaires) {
      updatedQuestionnaires = updatedQuestionnaires.map((q, i) => ({
        ...q,
        sequence: i + 1
      }));
    }
    
    if (newOptions.periodicQuestionnaires) {
      updatedQuestionnaires = updatedQuestionnaires.map(q => ({
        ...q,
        periodicity: 90,
        repetitions: 4
      }));
    }
    
    if (newOptions.verificationAfter) {
      updatedQuestionnaires = updatedQuestionnaires.map(q => ({
        ...q,
        repetitions: 1
      }));
    }
    
    setPlan({
      ...plan,
      options: newOptions,
      questionnaires: updatedQuestionnaires
    });
  };

  const getPlanType = () => {
    if (plan.options.progressQuestionnaires) return 'progress';
    if (plan.options.periodicQuestionnaires) return 'periodic';
    if (plan.options.multipleQuestionnaires) return 'multiple';
    if (plan.options.verificationAfter) return 'verification';
    if (plan.options.singleQuestionnaire) return 'single';
    return 'single'; // Default
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Caricamento in corso...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? 'Modifica Piano' : 'Crea Nuovo Piano'}
          </h1>
        </div>
        
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salva Piano'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Dettagli Piano</TabsTrigger>
          <TabsTrigger value="options">Opzioni</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionari</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Informazioni Base</CardTitle>
                <CardDescription>
                  Inserisci le informazioni di base per il piano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Piano</Label>
                    <Input 
                      id="name"
                      value={plan.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Es. Piano Base"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label htmlFor="price">Prezzo (€)</Label>
                        <Input 
                          id="price"
                          type="number"
                          value={plan.price}
                          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                          disabled={plan.is_free}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="flex items-center h-10 gap-2">
                        <Switch 
                          id="is_free"
                          checked={plan.is_free}
                          onCheckedChange={(checked) => handleChange('is_free', checked)}
                        />
                        <Label htmlFor="is_free">Gratuito</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={plan.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Descrivi brevemente questo piano"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Caratteristiche</Label>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input 
                        value={feature} 
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Es. Accesso a tutti i questionari"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center mt-2">
                    <Switch
                      id="plan-active"
                      checked={plan.isActive}
                      onCheckedChange={(checked) => handleChange('isActive', checked)}
                    />
                    <Label htmlFor="plan-active" className="ml-2">
                      Piano attivo e visibile agli utenti
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>Tipo di Piano</CardTitle>
              <CardDescription>
                Seleziona il tipo di piano e configura le relative opzioni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="plan-type">Tipo di Piano</Label>
                <Select 
                  value={getPlanType()}
                  onValueChange={handlePlanTypeChange}
                >
                  <SelectTrigger id="plan-type">
                    <SelectValue placeholder="Seleziona tipo piano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Questionario Singolo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="verification">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        <span>Verifica dopo periodo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="periodic">
                      <div className="flex items-center">
                        <RotateCcw className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Questionari periodici</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="multiple">
                      <div className="flex items-center">
                        <Copy className="h-4 w-4 mr-2 text-green-500" />
                        <span>Questionari multipli</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="progress">
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Progressione di apprendimento</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Descrizione del tipo selezionato</h3>
                {plan.options.singleQuestionnaire && (
                  <p className="text-sm text-muted-foreground">
                    Questo piano permette all'utente di compilare un singolo questionario una sola volta.
                  </p>
                )}
                {plan.options.verificationAfter && (
                  <p className="text-sm text-muted-foreground">
                    Questo piano permette all'utente di compilare un questionario e poi di ricompilarlo dopo un periodo specificato per una verifica dei progressi.
                  </p>
                )}
                {plan.options.periodicQuestionnaires && (
                  <p className="text-sm text-muted-foreground">
                    Questo piano permette all'utente di compilare lo stesso questionario periodicamente per monitorare i progressi nel tempo.
                  </p>
                )}
                {plan.options.multipleQuestionnaires && (
                  <p className="text-sm text-muted-foreground">
                    Questo piano permette all'utente di compilare più questionari diversi quando lo desidera, senza limitazioni.
                  </p>
                )}
                {plan.options.progressQuestionnaires && (
                  <p className="text-sm text-muted-foreground">
                    Questo piano permette un percorso di apprendimento progressivo con questionari in sequenza, ciascuno disponibile dopo il completamento del precedente.
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                {plan.options.verificationAfter && (
                  <div>
                    <Label htmlFor="verification-period">Periodo di verifica (giorni)</Label>
                    <Input 
                      id="verification-period"
                      type="number"
                      min={1}
                      value={plan.options.verificationPeriod || 90}
                      onChange={(e) => handleOptionChange('verificationPeriod', parseInt(e.target.value) || 90)}
                    />
                  </div>
                )}
                
                {plan.options.periodicQuestionnaires && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="periodicity">Periodicità (giorni)</Label>
                      <Input 
                        id="periodicity"
                        type="number"
                        min={1}
                        value={plan.options.verificationPeriod || 90}
                        onChange={(e) => handleOptionChange('verificationPeriod', parseInt(e.target.value) || 90)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-repetitions">Numero massimo di ripetizioni</Label>
                      <Input 
                        id="max-repetitions"
                        type="number"
                        min={1}
                        value={plan.options.maxRepetitions || 4}
                        onChange={(e) => handleOptionChange('maxRepetitions', parseInt(e.target.value) || 4)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questionnaires">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Questionari</CardTitle>
                  <CardDescription>
                    Seleziona i questionari da includere nel piano
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addQuestionnaire}
                  disabled={plan.options.singleQuestionnaire && plan.questionnaires.length > 0}
                >
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Questionario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {plan.questionnaires.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">Nessun questionario aggiunto</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={addQuestionnaire}
                    disabled={plan.options.singleQuestionnaire && plan.questionnaires.length > 0}
                  >
                    Aggiungi Questionario
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {plan.questionnaires.map((questionnaire, index) => (
                    <Card key={index}>
                      <CardHeader className="py-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {getQuestionnaireTitle(questionnaire.id)}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeQuestionnaire(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`questionnaire-${index}`}>Questionario</Label>
                            <Select 
                              value={questionnaire.id}
                              onValueChange={(value) => updateQuestionnaire(index, 'id', value)}
                            >
                              <SelectTrigger id={`questionnaire-${index}`}>
                                <SelectValue placeholder="Seleziona questionario" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableQuestionnaires.map((q) => (
                                  <SelectItem key={q.id} value={q.id}>
                                    {q.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {plan.options.progressQuestionnaires && (
                            <div>
                              <Label htmlFor={`sequence-${index}`}>Sequenza</Label>
                              <Input 
                                id={`sequence-${index}`}
                                type="number"
                                min={1}
                                value={questionnaire.sequence || index + 1}
                                onChange={(e) => updateQuestionnaire(index, 'sequence', parseInt(e.target.value) || index + 1)}
                              />
                            </div>
                          )}
                          
                          {(plan.options.periodicQuestionnaires || plan.options.verificationAfter) && (
                            <>
                              <div>
                                <Label htmlFor={`periodicity-${index}`}>Periodicità (giorni)</Label>
                                <Input 
                                  id={`periodicity-${index}`}
                                  type="number"
                                  min={1}
                                  value={questionnaire.periodicity || 90}
                                  onChange={(e) => updateQuestionnaire(index, 'periodicity', parseInt(e.target.value) || 90)}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`repetitions-${index}`}>Ripetizioni</Label>
                                <Input 
                                  id={`repetitions-${index}`}
                                  type="number"
                                  min={1}
                                  value={questionnaire.repetitions || 1}
                                  onChange={(e) => updateQuestionnaire(index, 'repetitions', parseInt(e.target.value) || 1)}
                                  disabled={plan.options.verificationAfter}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Notifiche</CardTitle>
              <CardDescription>
                Configura le notifiche per questo piano
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={plan.options.emailNotifications || false}
                    onCheckedChange={(checked) => handleOptionChange('emailNotifications', checked)}
                  />
                  <Label htmlFor="email-notifications">Notifiche Email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-notifications"
                    checked={plan.options.smsNotifications || false}
                    onCheckedChange={(checked) => handleOptionChange('smsNotifications', checked)}
                  />
                  <Label htmlFor="sms-notifications">Notifiche SMS</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsapp-notifications"
                    checked={plan.options.whatsappNotifications || false}
                    onCheckedChange={(checked) => handleOptionChange('whatsappNotifications', checked)}
                  />
                  <Label htmlFor="whatsapp-notifications">Notifiche WhatsApp</Label>
                </div>
              </div>
              
              {(plan.options.emailNotifications || plan.options.smsNotifications || plan.options.whatsappNotifications) && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Configurazione promemoria
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminder-days">Giorni prima della scadenza</Label>
                      <Input 
                        id="reminder-days"
                        type="number"
                        min={1}
                        value={plan.options.reminderDaysBefore || 7}
                        onChange={(e) => handleOptionChange('reminderDaysBefore', parseInt(e.target.value) || 7)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reminder-count">Numero di promemoria</Label>
                      <Input 
                        id="reminder-count"
                        type="number"
                        min={1}
                        max={10}
                        value={plan.options.reminderCount || 1}
                        onChange={(e) => handleOptionChange('reminderCount', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reminder-frequency">Frequenza dei promemoria</Label>
                    <Select 
                      value={plan.options.reminderFrequency || 'once'}
                      onValueChange={(value) => handleOptionChange('reminderFrequency', value)}
                    >
                      <SelectTrigger id="reminder-frequency">
                        <SelectValue placeholder="Seleziona frequenza" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Una sola volta</SelectItem>
                        <SelectItem value="daily">Ogni giorno</SelectItem>
                        <SelectItem value="weekly">Ogni settimana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reminder-message">Messaggio di promemoria</Label>
                    <Textarea
                      id="reminder-message"
                      value={plan.options.reminderMessage || 'È il momento di completare il tuo questionario! Accedi per continuare il tuo percorso.'}
                      onChange={(e) => handleOptionChange('reminderMessage', e.target.value)}
                      placeholder="Inserisci il messaggio per il promemoria"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanEditor;

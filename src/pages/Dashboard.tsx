
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { UserReports } from '@/components/dashboard/UserReports';
import QuestionnaireView from '@/components/dashboard/QuestionnaireView';
import { UserSubscriptions } from '@/components/dashboard/UserSubscriptions';
import { User, FileText, LogOut, FileDown, Bell, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [upcomingQuestionnaires, setUpcomingQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Verifica se l'utente è autenticato
  useEffect(() => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Accesso richiesto',
        description: 'Effettua il login per accedere alla dashboard',
      });
      navigate('/login');
    } else {
      // Carica i questionari per l'utente
      fetchUserQuestionnaires();
    }
  }, [user, navigate, toast]);

  const fetchUserQuestionnaires = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Recupera l'abbonamento attivo dell'utente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profile?.subscription_plan) {
        setUpcomingQuestionnaires([]);
        setLoading(false);
        return;
      }
      
      // Recupera informazioni sul piano
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('id', profile.subscription_plan)
        .single();
        
      if (planError) throw planError;
      
      // Recupera le impostazioni del piano
      const { data: planSettings, error: settingsError } = await supabase
        .from('plan_settings')
        .select('*')
        .eq('plan_id', plan.id)
        .single();
        
      if (settingsError) throw settingsError;
      
      // Recupera i questionari associati al piano
      const { data: planQuestionnaires, error: questionnairesError } = await supabase
        .from('plan_questionnaires')
        .select('questionnaire_id, sequence_order')
        .eq('plan_id', plan.id)
        .order('sequence_order', { ascending: true });
        
      if (questionnairesError) throw questionnairesError;
      
      if (!planQuestionnaires || planQuestionnaires.length === 0) {
        setUpcomingQuestionnaires([]);
        setLoading(false);
        return;
      }
      
      // Recupera i dettagli dei questionari
      const questionnaireIds = planQuestionnaires.map(q => q.questionnaire_id);
      const { data: questionnaireDetails, error: detailsError } = await supabase
        .from('questionnaire_config')
        .select('id, title, description')
        .in('id', questionnaireIds);
        
      if (detailsError) throw detailsError;
      
      // Recupera le risposte già date dall'utente
      const { data: responses, error: responsesError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', user.id);
        
      if (responsesError) throw responsesError;
      
      // Prepara i questionari da mostrare
      const questionnairesWithDates = planQuestionnaires.map(pq => {
        const details = questionnaireDetails.find(q => q.id === pq.questionnaire_id);
        const response = responses?.find(r => r.questionnaire_id === pq.questionnaire_id);
        
        let availableDate = new Date();
        let status = 'available';
        let nextAvailableDate = null;
        
        // Se è un piano sequenziale, il questionario è disponibile solo se i precedenti sono stati completati
        if (planSettings.is_sequential) {
          const previousQuestions = planQuestionnaires.filter(q => q.sequence_order < pq.sequence_order);
          const allPreviousCompleted = previousQuestions.every(q => 
            responses?.some(r => r.questionnaire_id === q.questionnaire_id && r.status === 'completed')
          );
          
          if (!allPreviousCompleted) {
            status = 'locked';
          }
        }
        
        // Se il questionario è stato già compilato
        if (response) {
          status = 'completed';
          
          // Se è un piano con ricompilazioni periodiche
          if (planSettings.can_retake && planSettings.retake_limit > 0) {
            const responseDate = new Date(response.completed_at || response.created_at);
            nextAvailableDate = addDays(responseDate, planSettings.retake_period_days);
            
            if (nextAvailableDate <= new Date()) {
              status = 'available';
            } else {
              status = 'waiting';
            }
          }
        }
        
        return {
          id: pq.questionnaire_id,
          title: details?.title || 'Questionario',
          description: details?.description || '',
          sequence: pq.sequence_order,
          status,
          availableDate,
          nextAvailableDate,
          completedDate: response?.completed_at ? new Date(response.completed_at) : null
        };
      });
      
      setUpcomingQuestionnaires(questionnairesWithDates);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile caricare i questionari'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'locked':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponibile';
      case 'completed':
        return 'Completato';
      case 'waiting':
        return 'In attesa';
      case 'locked':
        return 'Bloccato';
      default:
        return 'Sconosciuto';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <Bell className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'locked':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  if (!user) {
    return null; // Non renderizzare nulla se l'utente non è autenticato
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Utente</h1>
        <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="questionnaire" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Questionari
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            I miei report
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Abbonamenti
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profilo
          </TabsTrigger>
        </TabsList>
        
        {/* Contenuto Questionario */}
        <TabsContent value="questionnaire">
          <Card>
            <CardHeader>
              <CardTitle>I tuoi questionari</CardTitle>
              <CardDescription>
                Visualizza e gestisci i questionari disponibili nel tuo abbonamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Caricamento questionari in corso...</div>
              ) : upcomingQuestionnaires.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Non ci sono questionari disponibili nel tuo piano.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingQuestionnaires.map((questionnaire) => (
                    <Card key={questionnaire.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(questionnaire.status)}`}>
                              {getStatusIcon(questionnaire.status)}
                              <span className="ml-1">{getStatusText(questionnaire.status)}</span>
                            </span>
                            
                            {questionnaire.sequence && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                Sequenza {questionnaire.sequence}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-medium mt-2">{questionnaire.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{questionnaire.description}</p>
                          
                          {questionnaire.status === 'waiting' && questionnaire.nextAvailableDate && (
                            <p className="text-sm text-amber-600 mt-2">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Disponibile dal {format(questionnaire.nextAvailableDate, 'dd MMMM yyyy', { locale: it })}
                            </p>
                          )}
                          
                          {questionnaire.status === 'completed' && questionnaire.completedDate && (
                            <p className="text-sm text-blue-600 mt-2">
                              <FileText className="h-4 w-4 inline mr-1" />
                              Completato il {format(questionnaire.completedDate, 'dd MMMM yyyy', { locale: it })}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant={questionnaire.status === 'available' ? 'default' : 'outline'} 
                            disabled={questionnaire.status !== 'available'}
                            onClick={() => navigate(`/questionnaire/${questionnaire.id}`)}
                          >
                            {questionnaire.status === 'available' ? 'Compila ora' : 'Visualizza'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <QuestionnaireView />
        </TabsContent>
        
        {/* Contenuto Report */}
        <TabsContent value="reports">
          <UserReports />
        </TabsContent>
        
        {/* Contenuto Abbonamenti */}
        <TabsContent value="subscriptions">
          <UserSubscriptions />
        </TabsContent>
        
        {/* Contenuto Profilo */}
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

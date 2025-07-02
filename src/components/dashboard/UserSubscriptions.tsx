
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Calendar, 
  CreditCard, 
  Clock, 
  RotateCcw, 
  CheckSquare,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'canceled';
  is_free: boolean;
  features: string[];
  next_questionnaire_date?: string;
  questionnaires: {
    id: string;
    name: string;
    status: 'completed' | 'pending' | 'available';
    available_at?: string;
    sequence?: number;
  }[];
}

export const UserSubscriptions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // In un'implementazione reale, recupereremmo i dati da Supabase
        // Per ora, utilizziamo dei dati di esempio
        const demoSubscriptions: Subscription[] = [
          {
            id: '1',
            plan_name: 'Premium',
            plan_type: 'periodic',
            started_at: new Date(Date.now() - 30 * 86400000).toISOString(), // 30 giorni fa
            expires_at: new Date(Date.now() + 335 * 86400000).toISOString(), // 335 giorni nel futuro
            status: 'active',
            is_free: false,
            features: [
              'Accesso a tutti i questionari',
              'Verifiche periodiche',
              'Tracciamento dei progressi',
              'Report personalizzati',
              'Consulenza dedicata'
            ],
            next_questionnaire_date: new Date(Date.now() + 60 * 86400000).toISOString(), // 60 giorni nel futuro
            questionnaires: [
              { 
                id: '1', 
                name: 'Valutazione Iniziale', 
                status: 'completed' 
              },
              { 
                id: '2', 
                name: 'Valutazione Competenze', 
                status: 'available' 
              },
              { 
                id: '3', 
                name: 'Valutazione Periodica', 
                status: 'pending',
                available_at: new Date(Date.now() + 60 * 86400000).toISOString() // 60 giorni nel futuro
              }
            ]
          }
        ];
        
        setSubscriptions(demoSubscriptions);
      } catch (error) {
        console.error('Errore nel caricamento degli abbonamenti:', error);
        toast({
          variant: 'destructive',
          title: 'Errore',
          description: 'Non è stato possibile caricare gli abbonamenti',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscriptions();
  }, [user, toast]);
  
  const handleManageSubscription = () => {
    // In un'implementazione reale, qui reindirizzeremmo a una pagina di gestione abbonamenti
    // o a un portale cliente di servizi come Stripe
    toast({
      title: 'Funzionalità in arrivo',
      description: 'La gestione degli abbonamenti sarà disponibile a breve.',
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Attivo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Scaduto</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancellato</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completato</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">In attesa</Badge>;
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponibile</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Sconosciuto</Badge>;
    }
  };
  
  const getPlanTypeIcon = (planType: string) => {
    switch(planType) {
      case 'single':
        return <CheckSquare className="h-5 w-5 mr-2 text-gray-500" />;
      case 'verification':
        return <Clock className="h-5 w-5 mr-2 text-amber-500" />;
      case 'periodic':
        return <RotateCcw className="h-5 w-5 mr-2 text-blue-500" />;
      case 'multiple':
        return <FileText className="h-5 w-5 mr-2 text-green-500" />;
      case 'progress':
        return <CheckSquare className="h-5 w-5 mr-2 text-purple-500" />;
      default:
        return <CheckSquare className="h-5 w-5 mr-2 text-gray-500" />;
    }
  };
  
  const getPlanTypeName = (planType: string) => {
    switch(planType) {
      case 'single':
        return "Questionario singolo";
      case 'verification':
        return "Verifica dopo periodo";
      case 'periodic':
        return "Questionari periodici";
      case 'multiple':
        return "Questionari multipli";
      case 'progress':
        return "Progressione di apprendimento";
      default:
        return "Piano standard";
    }
  };

  const renderQuestionnaires = (subscription: Subscription) => {
    if (!subscription.questionnaires || subscription.questionnaires.length === 0) {
      return (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-gray-500">Nessun questionario disponibile</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium mb-2">Questionari del tuo piano:</h3>
        {subscription.questionnaires.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center">
              {q.status === 'completed' ? (
                <CheckSquare className="h-5 w-5 mr-2 text-green-500" />
              ) : q.status === 'available' ? (
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
              ) : (
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
              )}
              <div>
                <div className="font-medium">{q.name}</div>
                <div className="flex items-center text-xs">
                  {getStatusBadge(q.status)}
                  {q.status === 'pending' && q.available_at && (
                    <span className="ml-2 text-gray-500">
                      Disponibile dal: {new Date(q.available_at).toLocaleDateString('it-IT')}
                    </span>
                  )}
                  {q.sequence && (
                    <span className="ml-2 text-gray-500">
                      Sequenza: {q.sequence}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={q.status === 'pending'}
              onClick={() => window.location.href = `/questionnaire/${q.id}`}
            >
              {q.status === 'completed' ? 'Visualizza' : q.status === 'available' ? 'Compila' : 'In attesa'}
            </Button>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>I miei abbonamenti</CardTitle>
        <CardDescription>
          Gestisci i tuoi abbonamenti e piani attivi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map(subscription => (
              <Card key={subscription.id} className={`border-2 ${subscription.status === 'active' ? 'border-green-200' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center mb-1">
                        {getPlanTypeIcon(subscription.plan_type)}
                        <h3 className="font-semibold text-lg flex items-center">
                          Piano {subscription.plan_name}
                          <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-purple-100 text-purple-800">
                            {getPlanTypeName(subscription.plan_type)}
                          </span>
                          {subscription.is_free && (
                            <span className="ml-2 bg-green-100 px-2 py-0.5 rounded-full text-xs text-green-800">
                              Gratuito
                            </span>
                          )}
                        </h3>
                      </div>
                      <div>
                        {getStatusBadge(subscription.status)}
                      </div>
                    </div>
                  </div>
                  
                  {subscription.next_questionnaire_date && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Prossimo questionario previsto</p>
                        <p className="text-sm text-gray-600">
                          {new Date(subscription.next_questionnaire_date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Data inizio: {new Date(subscription.started_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Data scadenza: {new Date(subscription.expires_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Caratteristiche del piano:</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckSquare className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {renderQuestionnaires(subscription)}
                  
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={handleManageSubscription}
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gestisci abbonamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="mb-4">Non hai abbonamenti attivi</p>
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Visualizza i piani disponibili
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

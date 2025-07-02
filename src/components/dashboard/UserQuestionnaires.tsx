
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Plus, CheckSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Questionnaire {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'available' | 'locked' | 'waiting';
  last_updated?: string;
  next_available_date?: string;
  description?: string;
  sequence?: number;
}

export const UserQuestionnaires = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  
  useEffect(() => {
    const loadQuestionnaires = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // In un'implementazione reale, recupereremmo i dati da Supabase
        // Per ora, utilizziamo dei dati di esempio che riflettono il piano dell'utente
        const demoQuestionnaires: Questionnaire[] = [
          {
            id: '1',
            title: 'Valutazione Maturità Digitale',
            type: 'Maturità Digitale',
            status: 'available',
            description: 'Valuta il livello di digitalizzazione della tua azienda',
            sequence: 1
          },
          {
            id: '2',
            title: 'Analisi Competenze',
            type: 'Formazione',
            status: 'locked',
            description: 'Analizza le competenze digitali del personale',
            sequence: 2
          },
          {
            id: '3',
            title: 'Valutazione Infrastruttura IT',
            type: 'Tecnologia',
            status: 'waiting',
            next_available_date: '2025-06-15',
            description: 'Valuta lo stato attuale dell\'infrastruttura IT',
            sequence: 3
          },
          {
            id: '4',
            title: 'Questionario Sicurezza Informatica',
            type: 'Sicurezza',
            status: 'completed',
            last_updated: new Date().toISOString(),
            description: 'Verifica le misure di sicurezza informatica adottate',
            sequence: 4
          }
        ];
        
        setQuestionnaires(demoQuestionnaires);
      } catch (error) {
        console.error('Errore nel caricamento dei questionari:', error);
        toast({
          variant: 'destructive',
          title: 'Errore',
          description: 'Non è stato possibile caricare i questionari',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestionnaires();
  }, [user, toast]);
  
  const handleStartQuestionnaire = (id: string) => {
    navigate(`/questionnaire/${id}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Completato</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">In corso</span>;
      case 'available':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Disponibile</span>;
      case 'locked':
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Bloccato</span>;
      case 'waiting':
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">In attesa</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Non iniziato</span>;
    }
  };
  
  const getButtonText = (status: string) => {
    switch(status) {
      case 'completed':
        return 'Visualizza risposte';
      case 'in_progress':
        return 'Continua';
      case 'available':
        return 'Inizia';
      case 'locked':
        return 'Bloccato';
      case 'waiting':
        return 'In attesa';
      default:
        return 'Inizia';
    }
  };
  
  const isButtonDisabled = (status: string) => {
    return ['locked', 'waiting'].includes(status);
  };
  
  const getButtonIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <FileText className="h-4 w-4 mr-1" />;
      case 'waiting':
        return <Calendar className="h-4 w-4 mr-1" />;
      default:
        return <CheckSquare className="h-4 w-4 mr-1" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="mb-4">Non hai ancora questionari disponibili</p>
            <p className="text-sm text-gray-500">
              Controlla più tardi o contatta l'assistenza per maggiori informazioni
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {questionnaires.map(questionnaire => (
        <Card key={questionnaire.id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(questionnaire.status)}
                {questionnaire.sequence && (
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                    Sequenza {questionnaire.sequence}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{questionnaire.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{questionnaire.description}</p>
              <div className="flex space-x-4 text-xs text-muted-foreground mt-2">
                <span>Tipo: {questionnaire.type}</span>
                {questionnaire.last_updated && (
                  <span>Ultimo aggiornamento: {new Date(questionnaire.last_updated).toLocaleDateString('it-IT')}</span>
                )}
                {questionnaire.next_available_date && (
                  <span>Disponibile dal: {format(new Date(questionnaire.next_available_date), 'dd MMMM yyyy', { locale: it })}</span>
                )}
              </div>
            </div>
            <Button 
              onClick={() => handleStartQuestionnaire(questionnaire.id)}
              variant={questionnaire.status === 'completed' ? 'outline' : 'default'}
              disabled={isButtonDisabled(questionnaire.status)}
              className={questionnaire.status === 'available' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {getButtonIcon(questionnaire.status)}
              {getButtonText(questionnaire.status)}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

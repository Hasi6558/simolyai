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
// import { fetchAvailableQuestionnaires } from '@/services/questionnaire';

interface Questionnaire {
  id: string;
  title: string;
  status: string;
  // Optionally add more fields as needed
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
        // Fetch published questionnaires from backend API
        const res = await fetch('/api/forms');
        const result = await res.json();
        console.log('Fetched questionnaires from /api/forms:', result);
        
        // Check if the response has the correct structure
        if (result.success && result.data) {
          // Only show published forms
          const published = Array.isArray(result.data) ? result.data.filter(q => q.status === 'published') : [];
          setQuestionnaires(published);
        } else {
          console.error('Invalid API response structure:', result);
          setQuestionnaires([]);
        }
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
    navigate(`/questionnaire-surveyjs/${id}`);
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
              </div>
              <h3 className="font-semibold text-lg">{questionnaire.title}</h3>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import QuestionSaveConfirmation from '../questionSaveConfirmation';
import { HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'choice' | 'multiple';
  options?: string[];
  guide?: string;
}

const QuestionnaireView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);
  const [upcomingQuestionnaires, setUpcomingQuestionnaires] = useState<any[]>([]);
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [guidePopoverOpen, setGuidePopoverOpen] = useState(false);
  
  useEffect(() => {
    const loadQuestionnaire = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // In un'implementazione reale, recupereremmo il questionario da Supabase
        // Per ora, utilizziamo dei dati di esempio
        const demoQuestions: Question[] = [
          {
            id: '1',
            text: 'Qual è il livello di maturità digitale della tua azienda?',
            type: 'choice',
            options: ['Base', 'Intermedio', 'Avanzato'],
            guide: 'La maturità digitale fa riferimento al livello di adozione e integrazione delle tecnologie digitali nei processi aziendali.'
          },
          {
            id: '2',
            text: 'Quali tecnologie digitali utilizzi già nella tua azienda?',
            type: 'multiple',
            options: ['CRM', 'ERP', 'E-commerce', 'Social media', 'Analisi dati', 'Cloud computing'],
            guide: 'Considera tutti i sistemi e le tecnologie attualmente in uso, anche se non utilizzate in tutti i reparti.'
          },
          {
            id: '3',
            text: 'Quali sono le principali sfide digitali che affronti?',
            type: 'text',
            guide: 'Pensa alle difficoltà che la tua azienda incontra nell\'adozione o nell\'utilizzo di tecnologie digitali.'
          },
          {
            id: '4',
            text: 'Quanto investi annualmente in tecnologie digitali?',
            type: 'choice',
            options: ['Meno di 5.000€', 'Tra 5.000€ e 20.000€', 'Tra 20.000€ e 50.000€', 'Più di 50.000€'],
            guide: 'Considera tutti gli investimenti in hardware, software, servizi digitali e formazione del personale.'
          },
          {
            id: '5',
            text: 'Quali sono i tuoi obiettivi principali per la trasformazione digitale nei prossimi 12 mesi?',
            type: 'text',
            guide: 'I principali obiettivi che la tua azienda intende raggiungere attraverso la trasformazione digitale.'
          }
        ];
        
        setQuestions(demoQuestions);
        
        // Carica i futuri questionari disponibili per l'utente
        const futureDemoQuestionnaires = [
          {
            id: 'q1',
            title: 'Valutazione Bisogni Formativi',
            availableDate: '15/06/2025',
            available: false
          },
          {
            id: 'q2',
            title: 'Indagine Soddisfazione Cliente',
            availableDate: '30/05/2025',
            available: true
          }
        ];
        
        setUpcomingQuestionnaires(futureDemoQuestionnaires);
      } catch (error) {
        console.error('Errore nel caricamento del questionario:', error);
        toast({
          variant: 'destructive',
          title: 'Errore',
          description: 'Non è stato possibile caricare il questionario',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestionnaire();
  }, [user, toast]);
  
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // In un'implementazione reale, qui invieremmo le risposte al backend come bozza
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Bozza salvata',
        description: 'Il tuo questionario è stato salvato come bozza',
      });
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Errore nel salvataggio della bozza:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Non è stato possibile salvare la bozza',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // In un'implementazione reale, qui invieremmo le risposte al backend
      // Per ora, simula un ritardo e poi reindirizza alla pagina del report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportId = "demo-report-1"; // In un'implementazione reale, questo verrebbe dal backend
      
      toast({
        title: 'Questionario completato',
        description: 'Il tuo report è stato generato con successo',
      });
      
      // Reindirizza alla pagina del report
      navigate(`/report/${reportId}`);
      
    } catch (error) {
      console.error('Errore nell\'invio delle risposte:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Non è stato possibile inviare le risposte',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStartQuestionnaire = (questionnaireId: string) => {
            navigate(`/questionnaire-surveyjs/${questionnaireId}`);
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
  
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-lg">Nessun questionario disponibile al momento.</p>
            <p className="text-sm text-gray-500 mt-2">Controlla più tardi o contatta l'assistenza.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Questionario di Valutazione</CardTitle>
            <CardDescription>
              Rispondi alle domande per ricevere il tuo report personalizzato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Domanda {currentQuestion + 1} di {questions.length}</span>
                <span className="text-sm text-gray-500">{Math.round((currentQuestion + 1) / questions.length * 100)}% completato</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${(currentQuestion + 1) / questions.length * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center">
                <h3 className="text-xl font-medium mr-2">{currentQ.text}</h3>
                {currentQ.guide && (
                  <Popover open={guidePopoverOpen} onOpenChange={setGuidePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className="ml-1 flex items-center justify-center rounded-full border border-blue-300 bg-white text-purple-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-purple-400" style={{ width: 28, height: 28 }}>
                        <HelpCircle className="h-5 w-5" color="#7c3aed" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs">
                      <div className="font-semibold mb-1">Guida</div>
                      <div className="text-sm text-blue-800">{currentQ.guide}</div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <div className="mt-4">
                {currentQ.type === 'text' && (
                  <textarea
                    className="w-full p-3 border rounded-lg min-h-32"
                    placeholder="Scrivi la tua risposta qui..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  />
                )}
                
                {currentQ.type === 'choice' && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((option, idx) => (
                      <div key={idx} className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-50"
                           onClick={() => handleAnswer(currentQ.id, option)}>
                        <input
                          type="radio"
                          id={`option-${idx}`}
                          name={`question-${currentQ.id}`}
                          checked={answers[currentQ.id] === option}
                          onChange={() => handleAnswer(currentQ.id, option)}
                          className="text-purple-600"
                        />
                        <label htmlFor={`option-${idx}`} className="text-gray-700 w-full cursor-pointer ml-3">{option}</label>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentQ.type === 'multiple' && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((option, idx) => {
                      const selectedOptions = answers[currentQ.id] || [];
                      const isChecked = selectedOptions.includes(option);
                      
                      return (
                        <div key={idx} className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-50"
                             onClick={() => {
                               if (isChecked) {
                                 handleAnswer(
                                   currentQ.id,
                                   selectedOptions.filter(item => item !== option)
                                 );
                               } else {
                                 handleAnswer(currentQ.id, [...selectedOptions, option]);
                               }
                             }}>
                          <input
                            type="checkbox"
                            id={`option-multi-${idx}`}
                            className="mr-3 text-purple-600"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                handleAnswer(
                                  currentQ.id,
                                  selectedOptions.filter(item => item !== option)
                                );
                              } else {
                                handleAnswer(currentQ.id, [...selectedOptions, option]);
                              }
                            }}
                          />
                          <label htmlFor={`option-multi-${idx}`} className="text-gray-700 w-full cursor-pointer">{option}</label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Precedente
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setDraftConfirmOpen(true)} 
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Salva in bozza
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>Successiva</Button>
              ) : (
                <Button 
                  onClick={() => setSubmitConfirmOpen(true)} 
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      Invia <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Pannello laterale destro */}
      <div className="md:col-span-1">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informazioni Domanda</CardTitle>
            </CardHeader>
            <CardContent>
              {guidePopoverOpen && currentQ.guide ? (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-semibold text-sm mb-1">Guida</h4>
                  <p className="text-sm text-blue-800">{currentQ.guide}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Clicca il pulsante <span className="font-bold">?</span> per visualizzare la guida, se disponibile.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Questionari Futuri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingQuestionnaires.length > 0 ? (
                upcomingQuestionnaires.map((q, idx) => (
                  <div key={idx} className={`border rounded-md p-3 ${q.available ? 'cursor-pointer hover:border-purple-400 hover:bg-purple-50' : ''}`}
                      onClick={() => q.available ? handleStartQuestionnaire(q.id) : null}>
                    <p className="font-medium text-sm">{q.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Disponibile dal: {q.availableDate}</p>
                      {q.available && (
                        <span className="text-xs text-green-600 font-medium">Disponibile</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nessun questionario futuro disponibile.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogo di conferma salvataggio bozza */}
      <QuestionSaveConfirmation
        mode="draft"
        open={draftConfirmOpen}
        onOpenChange={setDraftConfirmOpen}
        onConfirm={handleSaveDraft}
      />
      
      {/* Dialogo di conferma invio */}
      <QuestionSaveConfirmation
        mode="submit"
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default QuestionnaireView;

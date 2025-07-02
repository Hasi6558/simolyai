import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Send, HelpCircle, Star, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/MainNavigation';
import QuestionSaveConfirmation from '@/components/questionSaveConfirmation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  options?: Array<{ id: string; value: string; label: string; image?: string }>;
  required: boolean;
  guide?: string;
  maxStars?: number;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  columns?: Array<{ label: string; value: string; type: string }>;
  rows?: Array<{ label: string; value: string }>;
  multiple?: boolean;
  accept?: string;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

// Funzione di utility per renderizzare l'input della domanda
const QuestionForm = ({ question, value, onChange }) => {
  switch (question.type) {
    case 'radio':
      return (
        <div className="space-y-3 mt-4">
          {question.options?.map((option, idx) => (
            <div
              key={idx}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                value === option.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => onChange(option.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`option-${question.id}-${idx}`}
                  name={`question-${question.id}`}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="mr-3 text-purple-600"
                />
                <label
                  htmlFor={`option-${question.id}-${idx}`}
                  className="cursor-pointer w-full text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-3 mt-4">
          {question.options?.map((option, idx) => {
            const isChecked = Array.isArray(value) && value.includes(option.value);
            return (
              <div
                key={idx}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
                onClick={() => {
                  const newValue = Array.isArray(value) ? [...value] : [];
                  if (isChecked) {
                    onChange(newValue.filter(v => v !== option.value));
                  } else {
                    onChange([...newValue, option.value]);
                  }
                }}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`option-${question.id}-${idx}`}
                    checked={isChecked}
                    onChange={() => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (isChecked) {
                        onChange(newValue.filter(v => v !== option.value));
                      } else {
                        onChange([...newValue, option.value]);
                      }
                    }}
                    className="mr-3 text-purple-600"
                  />
                  <label
                    htmlFor={`option-${question.id}-${idx}`}
                    className="cursor-pointer w-full text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      );
    case 'text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scrivi la tua risposta qui..."
          className="w-full min-h-[150px] p-4 border-2 border-gray-200 rounded-xl mt-4 focus:border-purple-400 focus:ring focus:ring-purple-200"
        />
      );
    case 'image-choice':
      return (
        <div className="flex flex-wrap gap-4 mt-4">
          {question.options?.map((option, idx) => (
            <button
              key={option.value}
              type="button"
              className={`border-2 rounded-xl p-2 flex flex-col items-center w-32 h-40 cursor-pointer transition-colors ${
                value === option.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => onChange(option.value)}
            >
              <img src={option.image} alt={option.label} className="w-20 h-20 object-contain mb-2" />
              <span className="text-center text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      );
    case 'star-rating':
      const maxStars = question.maxStars || 5;
      return (
        <div className="flex items-center gap-2 mt-4">
          {[...Array(maxStars)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="focus:outline-none"
            >
              <Star className={`w-8 h-8 ${value >= i + 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
          {value && <span className="ml-2 text-lg font-medium">{value}</span>}
        </div>
      );
    case 'range':
      return (
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="range"
            min={question.min || 0}
            max={question.max || 10}
            step={question.step || 1}
            value={value || question.min || 0}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{question.minLabel || question.min || 0}</span>
            <span>{value ?? question.min ?? 0}</span>
            <span>{question.maxLabel || question.max || 10}</span>
          </div>
        </div>
      );
    case 'currency':
      return (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-lg font-bold">€</span>
          <input
            type="number"
            min={question.min || 0}
            step={question.step || 1}
            value={value || ''}
            onChange={e => onChange(Number(e.target.value))}
            className="border-2 border-gray-200 rounded-xl p-2 w-32 focus:border-purple-400 focus:ring focus:ring-purple-200"
            placeholder="0"
          />
        </div>
      );
    case 'table':
      // Table with checkboxes or inputs per cell
      return (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border text-center">
            <thead>
              <tr>
                <th className="border p-2"></th>
                {question.columns?.map((col, cidx) => (
                  <th key={cidx} className="border p-2">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.rows?.map((row, ridx) => (
                <tr key={ridx}>
                  <td className="border p-2 font-medium">{row.label}</td>
                  {question.columns?.map((col, cidx) => (
                    <td key={cidx} className="border p-2">
                      {col.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={Array.isArray(value?.[row.value]) && value[row.value].includes(col.value)}
                          onChange={e => {
                            const rowVals = Array.isArray(value?.[row.value]) ? [...value[row.value]] : [];
                            if (e.target.checked) {
                              onChange({ ...value, [row.value]: [...rowVals, col.value] });
                            } else {
                              onChange({ ...value, [row.value]: rowVals.filter(v => v !== col.value) });
                            }
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value?.[row.value]?.[col.value] || ''}
                          onChange={e => {
                            onChange({
                              ...value,
                              [row.value]: {
                                ...(value?.[row.value] || {}),
                                [col.value]: e.target.value
                              }
                            });
                          }}
                          className="border rounded p-1 w-16"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'file':
      const fileInputRef = useRef();
      return (
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            multiple={question.multiple}
            accept={question.accept || '.doc,.pdf,.xlsx,.png,.gif,.jpg,.jpeg,.tif,.xml'}
            onChange={e => onChange(e.target.files ? Array.from(e.target.files) : [])}
            className="block"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(value) && value.length > 0 && value.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">
                <UploadCloud className="w-4 h-4 text-purple-600" />
                {file.name}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <p>Tipo di domanda non supportato</p>;
  }
};

const Questionnaire = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showGuide, setShowGuide] = useState<string | null>(null);
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [upcomingQuestionnaires, setUpcomingQuestionnaires] = useState<any[]>([]);
  
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        // Mock data - in a real app, you'd fetch from an API
        setTimeout(() => {
          const mockQuestionnaire = {
            id: id || '123',
            title: 'Valutazione Maturità Digitale',
            description: 'Questo questionario valuta il livello di maturità digitale della tua azienda.',
            questions: [
              {
                id: 'q1',
                type: 'radio',
                title: 'Qual è il livello di digitalizzazione dei processi interni?',
                guide: 'Valuta quanto i processi interni dell\'azienda sono stati digitalizzati. Considera aspetti come la gestione documentale, comunicazioni interne, approvazioni, ecc.',
                options: [
                  { id: 'opt1', value: '1', label: 'Basso - Processi principalmente cartacei' },
                  { id: 'opt2', value: '2', label: 'Medio-basso - Alcuni processi digitalizzati' },
                  { id: 'opt3', value: '3', label: 'Medio - Circa metà dei processi sono digitalizzati' },
                  { id: 'opt4', value: '4', label: 'Medio-alto - La maggior parte dei processi sono digitalizzati' },
                  { id: 'opt5', value: '5', label: 'Alto - Processi completamente digitalizzati' }
                ],
                required: true
              },
              {
                id: 'q2',
                type: 'radio',
                title: 'Quanto è avanzata la vostra infrastruttura IT?',
                guide: 'Considera aspetti come l\'aggiornamento dell\'hardware, del software, la sicurezza informatica, e l\'utilizzo del cloud.',
                options: [
                  { id: 'opt1', value: '1', label: 'Base - Hardware e software obsoleti' },
                  { id: 'opt2', value: '2', label: 'Medio-bassa - Alcune componenti aggiornate' },
                  { id: 'opt3', value: '3', label: 'Media - Infrastruttura parzialmente aggiornata' },
                  { id: 'opt4', value: '4', label: 'Medio-alta - Infrastruttura moderna' },
                  { id: 'opt5', value: '5', label: 'Avanzata - Infrastruttura all\'avanguardia e cloud-based' }
                ],
                required: true
              },
              {
                id: 'q3',
                type: 'radio',
                title: 'Come valuti le competenze digitali del personale?',
                guide: 'Valuta il livello di familiarità e competenza del personale con gli strumenti digitali utilizzati dall\'azienda, la capacità di adattamento a nuove tecnologie e la formazione continua.',
                options: [
                  { id: 'opt1', value: '1', label: 'Basse - Difficoltà con strumenti digitali base' },
                  { id: 'opt2', value: '2', label: 'Medio-basse - Competenze minime' },
                  { id: 'opt3', value: '3', label: 'Medie - Competenze adeguate per i ruoli' },
                  { id: 'opt4', value: '4', label: 'Medio-alte - Buone competenze digitali' },
                  { id: 'opt5', value: '5', label: 'Alte - Personale altamente qualificato in competenze digitali' }
                ],
                required: true
              },
              {
                id: 'q4',
                type: 'text',
                title: 'Quali sono le principali sfide digitali che la tua azienda sta affrontando?',
                guide: 'Descrivi le principali difficoltà o ostacoli che la tua azienda sta incontrando nel processo di trasformazione digitale.',
                required: false
              },
              {
                id: 'q5',
                type: 'checkbox',
                title: 'Quali tecnologie emergenti state considerando di adottare nei prossimi 12 mesi?',
                guide: 'Seleziona tutte le tecnologie che state valutando di implementare nel prossimo anno.',
                options: [
                  { id: 'opt1', value: 'ai', label: 'Intelligenza Artificiale' },
                  { id: 'opt2', value: 'blockchain', label: 'Blockchain' },
                  { id: 'opt3', value: 'iot', label: 'Internet of Things (IoT)' },
                  { id: 'opt4', value: 'cloud', label: 'Migrazione al Cloud' },
                  { id: 'opt5', value: 'automation', label: 'Automazione dei processi' },
                  { id: 'opt6', value: 'data_analytics', label: 'Analisi dei dati avanzata' },
                  { id: 'opt7', value: 'none', label: 'Nessuna' }
                ],
                required: true
              }
            ]
          };
          
          // Carica i futuri questionari disponibili per l'utente
          const futureDemoQuestionnaires = [
            {
              id: 'q1',
              title: 'Valutazione Bisogni Formativi',
              availableDate: '15/06/2025'
            },
            {
              id: 'q2',
              title: 'Indagine Soddisfazione Cliente',
              availableDate: '30/09/2025'
            }
          ];
          
          setUpcomingQuestionnaires(futureDemoQuestionnaires);
          setQuestionnaire(mockQuestionnaire);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare il questionario',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id, toast]);

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowGuide(null);
    }
  };

  const handleNextQuestion = () => {
    if (questionnaire) {
      const currentQuestion = questionnaire.questions[currentQuestionIndex];
      
      // Check if current question is required and has an answer
      if (currentQuestion.required && !answers[currentQuestion.id]) {
        toast({
          title: 'Risposta richiesta',
          description: 'Per favore, rispondi alla domanda corrente per continuare.',
          variant: 'destructive',
        });
        return;
      }
      
      if (currentQuestionIndex < questionnaire.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowGuide(null);
      }
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Salvato in bozza',
        description: 'Il questionario è stato salvato in bozza e puoi riprenderlo in seguito.',
      });
      
      setSaving(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il salvataggio',
        variant: 'destructive',
      });
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Validate all required questions have answers
      if (questionnaire) {
        const unansweredRequired = questionnaire.questions.filter(
          q => q.required && !answers[q.id]
        );
        
        if (unansweredRequired.length > 0) {
          toast({
            title: 'Domande senza risposta',
            description: `Ci sono ${unansweredRequired.length} domande obbligatorie senza risposta.`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }
      
      // In a real app, you would submit your answers to the API here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Questionario inviato',
        description: 'Il questionario è stato inviato con successo!',
      });
      
      setSaving(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'invio',
        variant: 'destructive',
      });
      setSaving(false);
    }
  };

  const toggleGuide = (questionId: string) => {
    if (showGuide === questionId) {
      setShowGuide(null);
    } else {
      setShowGuide(questionId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <MainNavigation variant="questionnaire" title="Caricamento..." />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="container mx-auto p-6">
        <MainNavigation variant="questionnaire" title="Errore" />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Questionario non trovato</h2>
          <Button onClick={() => navigate('/dashboard')}>Torna alla Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / questionnaire.questions.length) * 100);

  return (
    <div className="container mx-auto">
      <MainNavigation variant="questionnaire" title={questionnaire.title} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="text-gray-600">{questionnaire.description}</p>
          )}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Domanda {currentQuestionIndex + 1} di {questionnaire.questions.length}</span>
              <span>{progress}% completato</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>{currentQuestion.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionForm
                  question={currentQuestion}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Precedente
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setDraftConfirmOpen(true)}
                    className="flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salva in bozza
                  </Button>
                  
                  {currentQuestionIndex < questionnaire.questions.length - 1 ? (
                    <Button onClick={handleNextQuestion}>
                      Successiva
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setSubmitConfirmOpen(true)} 
                      disabled={saving}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Invia
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informazioni Domanda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.guide && (
                  <div className="bg-blue-50 p-4 rounded-md min-h-[80px] flex flex-col justify-start items-center">
                    <span className="font-medium mb-2">Guida</span>
                    {showGuide !== currentQuestion.id && (
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-full border border-blue-300 bg-white text-purple-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
                        style={{ width: 40, height: 40 }}
                        onClick={() => setShowGuide(currentQuestion.id)}
                      >
                        <HelpCircle className="h-7 w-7" color="#7c3aed" />
                      </button>
                    )}
                    {showGuide === currentQuestion.id && (
                      <div className="mt-2 w-full">
                        <p className="text-sm text-blue-800 text-center">{currentQuestion.guide}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3 mt-6">
                  <h3 className="font-medium">Questionari Futuri</h3>
                  {upcomingQuestionnaires.map((q, idx) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <p className="font-medium">{q.title}</p>
                      <p className="text-xs text-gray-500">Disponibile dal: {q.availableDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <QuestionSaveConfirmation
        mode="draft"
        open={draftConfirmOpen}
        onOpenChange={setDraftConfirmOpen}
        onConfirm={handleSaveDraft}
      />
      
      <QuestionSaveConfirmation
        mode="submit"
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default Questionnaire;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Send, HelpCircle, Star, UploadCloud, X } from 'lucide-react';
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
  lesson?: string;
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
    case 'boolean':
    case 'yesno':
      return (
        <div className="space-y-3 mt-4">
          <div
            className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              value === true
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
            onClick={() => onChange(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-yes`}
                name={`question-${question.id}`}
                checked={value === true}
                onChange={() => onChange(true)}
                className="mr-3 text-purple-600"
              />
              <label
                htmlFor={`${question.id}-yes`}
                className="cursor-pointer w-full text-gray-700 font-medium"
              >
                Sì
              </label>
            </div>
          </div>
          
          <div
            className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              value === false
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
            onClick={() => onChange(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-no`}
                name={`question-${question.id}`}
                checked={value === false}
                onChange={() => onChange(false)}
                className="mr-3 text-purple-600"
              />
              <label
                htmlFor={`${question.id}-no`}
                className="cursor-pointer w-full text-gray-700 font-medium"
              >
                No
              </label>
            </div>
          </div>
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
  const [guidePopup, setGuidePopup] = useState<{ show: boolean; title: string; content: string }>({
    show: false,
    title: '',
    content: ''
  });
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [upcomingQuestionnaires, setUpcomingQuestionnaires] = useState<any[]>([]);
  const [showLesson, setShowLesson] = useState(false);
  
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) throw new Error('Questionnaire not found');
        const result = await res.json();
        
        console.log('Questionnaire API Response:', result);
        
        // Check if the response has the correct structure
        if (!result.success || !result.data) {
          throw new Error('Invalid API response structure');
        }
        
        const data = result.data;
        
        // Process the questions from the SurveyJS format
        let questions = [];
        if (data.questions && data.questions.pages && data.questions.pages.length > 0) {
          // Extract questions from SurveyJS format
          questions = data.questions.pages[0].elements?.map(element => ({
            id: element.name,
            type: element.type,
            title: element.title || element.name,
            description: element.description,
            required: element.isRequired || false,
            guide: element.guide,
            lesson: element.lesson,
            options: element.choices?.map((choice, index) => ({
              id: `option-${index}`,
              value: choice,
              label: choice
            })) || []
          })) || [];
        }
        
        console.log('Processed questions:', questions);
        
        setQuestionnaire({
          id: data.id,
          title: data.title,
          description: data.description,
          questions: questions,
        });
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare il questionario',
          variant: 'destructive',
        });
        setQuestionnaire(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestionnaire();
  }, [id, toast]);

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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

  // Close popup when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && guidePopup.show) {
        setGuidePopup({ show: false, title: '', content: '' });
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (guidePopup.show && e.target instanceof Element) {
        const popup = e.target.closest('.guide-popup');
        const overlay = e.target.closest('.guide-overlay');
        if (!popup && overlay) {
          setGuidePopup({ show: false, title: '', content: '' });
        }
      }
    };

    if (guidePopup.show) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [guidePopup.show]);

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

  // Add demo data for future questionnaires
  const futureQuestionnaires = [
    {
      id: 'future-1',
      title: 'Valutazione Bisogni Formativi',
      availableDate: '15/06/2025'
    },
    {
      id: 'future-2',
      title: 'Indagine Soddisfazione Cliente',
      availableDate: '30/09/2025'
    }
  ];

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
            <div
              onMouseEnter={() => setShowLesson(true)}
              onMouseLeave={() => setShowLesson(false)}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    {currentQuestion.title}
                    {currentQuestion.guide && (
                      <button
                        type="button"
                        onClick={() => setGuidePopup({
                          show: true,
                          title: currentQuestion.title,
                          content: currentQuestion.guide
                        })}
                        className="guide-button ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                        aria-label={`Show guide for ${currentQuestion.title}`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    )}
                  </CardTitle>
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
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informazioni Domanda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Guide box removed from sidebar - now shown as popup */}

                {/* LESSON/APPROFONDIMENTO: show only on hover */}
                {currentQuestion.lesson && showLesson && (
                  <div className="bg-yellow-50 p-4 rounded-md min-h-[80px] flex flex-col justify-start items-center">
                    <span className="font-medium mb-2">Approfondimento</span>
                    <div className="mt-2 w-full">
                      <p className="text-sm text-yellow-800 text-center">{currentQuestion.lesson}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 mt-6">
                  <h3 className="font-medium">Questionari Futuri</h3>
                  {futureQuestionnaires.map((q, idx) => (
                    <div key={q.id} className="p-3 border rounded-md">
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

      {/* Guide Popup */}
      {guidePopup.show && (
        <div 
          className="guide-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-title"
        >
          <div className="guide-popup bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 id="guide-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Guide: {guidePopup.title}
              </h3>
              <button
                onClick={() => setGuidePopup({ show: false, title: '', content: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">{guidePopup.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;

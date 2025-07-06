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
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useMediaQuery } from 'react-responsive';

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
  visible?: boolean;
  visibleIf?: string;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

const Questionnaire = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [surveyJson, setSurveyJson] = useState<any>(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [guidePopup, setGuidePopup] = useState<{ show: boolean; title: string; content: string }>({
    show: false,
    title: '',
    content: ''
  });
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [upcomingQuestionnaires, setUpcomingQuestionnaires] = useState<any[]>([]);
  const [showLesson, setShowLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const surveyRef = useRef<any>(null);
  
  // Survey model with events - moved before early returns
  const surveyModel = React.useMemo(() => {
    console.log('Creating SurveyJS model with:', surveyJson);
    if (!surveyJson) return null;
    
    const model = new Model(surveyJson);
    console.log('SurveyJS model created:', model);
    
    // Register custom properties for guide and lesson
    try {
      // Add custom properties to all question types
      const questionTypes = ['checkbox', 'radiogroup', 'text', 'comment', 'dropdown', 'rating', 'boolean', 'file', 'matrix'];
      questionTypes.forEach(type => {
        if (model.questionFactory) {
          const questionClass = model.questionFactory.createQuestion(type);
          if (questionClass) {
            // Register guide property
            questionClass.addProperty('guide', {
              type: 'string',
              category: 'general',
              title: 'Guide',
              description: 'Help text for this question'
            });
            
            // Register lesson property
            questionClass.addProperty('lesson', {
              type: 'string',
              category: 'general',
              title: 'Lesson',
              description: 'Educational content for this question'
            });
          }
        }
      });
      
      console.log('Custom properties registered successfully');
    } catch (error) {
      console.log('Error registering custom properties:', error);
    }
    
    // Attach event handlers directly to the model
    const onAfterRenderQuestion = (_sender: any, options: any) => {
      const question = options.question;
      const questionElement = options.htmlElement;
      
      // Look for guide and lesson in the original survey data
      let guide = null;
      let lesson = null;
      
      // Try to find the question in the original data
      if (surveyJson && surveyJson.pages) {
        for (const page of surveyJson.pages) {
          if (page.elements) {
            const originalQuestion = page.elements.find((q: any) => q.name === question.name);
            if (originalQuestion) {
              guide = originalQuestion.guide;
              lesson = originalQuestion.lesson;
              break;
            }
          }
        }
      }
      
      console.log('onAfterRenderQuestion called for:', question.name, {
        hasGuide: !!guide,
        hasLesson: !!lesson,
        guide: guide,
        lesson: lesson,
        questionProperties: Object.keys(question),
        originalDataFound: !!(guide || lesson)
      });
      
      // Guide popup button - improved positioning
      if (guide) {
        console.log('Adding guide button for question:', question.name);
        
        // Try multiple selectors to find the title element
        const titleSelectors = [
          '.sv-question__title',
          '.sv-question__title-text',
          '.sv-question__title h5',
          '.sv-question__title h4',
          '.sv-question__title h3',
          '.sv-question__title h2',
          '.sv-question__title h1',
          '.sv-question__title span',
          '.sv-question__title div',
          '.sv-question__title'
        ];
        
        let titleEl = null;
        let usedSelector = '';
        
        for (const selector of titleSelectors) {
          const element = questionElement.querySelector(selector);
          if (element) {
            titleEl = element;
            usedSelector = selector;
            break;
          }
        }
        
        console.log('Title element search:', {
          found: !!titleEl,
          usedSelector,
          questionElementClasses: questionElement.className,
          questionElementHTML: questionElement.innerHTML.substring(0, 200) + '...'
        });
        
        if (titleEl) {
          // Remove any existing guide button first
          const existingBtn = titleEl.querySelector('.guide-button');
          if (existingBtn) {
            existingBtn.remove();
          }
          
          const btn = document.createElement('button');
          btn.className = 'guide-button ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors';
          btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
          btn.onclick = () => setGuidePopup({ show: true, title: question.title || question.name, content: guide });
          
          // Try to insert the button after the title text
          const titleText = titleEl.querySelector('.sv-question__title-text') || titleEl;
          if (titleText && titleText.parentNode) {
            titleText.parentNode.insertBefore(btn, titleText.nextSibling);
            console.log('Guide button added successfully');
          } else {
            // Fallback: append to the title element
            titleEl.appendChild(btn);
            console.log('Guide button added successfully (fallback)');
          }
        } else {
          console.log('Could not find title element for question:', question.name);
          console.log('Available elements in question:', Array.from(questionElement.children).map(child => ({
            tagName: (child as HTMLElement).tagName,
            className: (child as HTMLElement).className,
            textContent: (child as HTMLElement).textContent?.substring(0, 50)
          })));
        }
      }
      
      // Lesson hover functionality
      if (lesson) {
        console.log('Adding lesson tooltip for question:', question.name);
        // Add hover tooltip to the entire question
        (questionElement as HTMLElement).style.position = 'relative';
        questionElement.setAttribute('data-lesson', lesson);
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'lesson-tooltip absolute z-10 bg-yellow-100 border border-yellow-300 rounded-md p-3 shadow-lg max-w-xs opacity-0 pointer-events-none transition-opacity duration-200';
        tooltip.style.top = '-10px';
        tooltip.style.left = '100%';
        tooltip.style.marginLeft = '10px';
        tooltip.innerHTML = `
          <div class="text-sm">
            <div class="font-medium text-yellow-800 mb-1">Approfondimento</div>
            <div class="text-yellow-700">${lesson}</div>
          </div>
          <div class="absolute top-2 -left-1 w-2 h-2 bg-yellow-100 border-l border-t border-yellow-300 transform rotate-45"></div>
        `;
        
        questionElement.appendChild(tooltip);
        
        // Create event listener functions
        const handleMouseEnter = () => {
          tooltip.style.opacity = '1';
          tooltip.style.pointerEvents = 'auto';
        };
        
        const handleMouseLeave = () => {
          tooltip.style.opacity = '0';
          tooltip.style.pointerEvents = 'none';
        };
        
        // Add hover events
        questionElement.addEventListener('mouseenter', handleMouseEnter);
        questionElement.addEventListener('mouseleave', handleMouseLeave);
        
        console.log('Lesson tooltip added successfully');
        
        // Update lesson sidebar for the current question
        setCurrentLesson(lesson);
      } else {
        setCurrentLesson(null);
      }
    };
    
    const onCurrentPageChanged = (sender: any, options: any) => {
      // Find the first question with a lesson on the new page
      const page = options.newCurrentPage;
      const lessonQ = page && page.questions && page.questions.find((q: any) => {
        // Look for lesson in original data
        if (surveyJson && surveyJson.pages) {
          for (const surveyPage of surveyJson.pages) {
            if (surveyPage.elements) {
              const originalQuestion = surveyPage.elements.find((oq: any) => oq.name === q.name);
              if (originalQuestion && originalQuestion.lesson) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      let lesson = null;
      if (lessonQ && surveyJson && surveyJson.pages) {
        for (const page of surveyJson.pages) {
          if (page.elements) {
            const originalQuestion = page.elements.find((q: any) => q.name === lessonQ.name);
            if (originalQuestion) {
              lesson = originalQuestion.lesson;
              break;
            }
          }
        }
      }
      setCurrentLesson(lesson);
    };
    
    const onComplete = (sender: any) => {
      toast({
        title: 'Questionario inviato',
        description: 'Il questionario è stato inviato con successo!',
      });
      navigate('/dashboard');
    };
    
    // Attach events to the model
    model.onAfterRenderQuestion.add(onAfterRenderQuestion);
    model.onCurrentPageChanged.add(onCurrentPageChanged);
    model.onComplete.add(onComplete);
    
    console.log('SurveyJS events attached successfully to model');
    
    return model;
  }, [surveyJson, navigate, toast]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) throw new Error('Questionnaire not found');
        const result = await res.json();
        if (!result.success || !result.data) throw new Error('Invalid API response structure');
        const data = result.data;
        
        console.log('Fetched questionnaire data:', data);
        console.log('Questions structure:', data.questions);
        console.log('Pages array:', data.questions.pages);
        if (data.questions.pages && data.questions.pages.length > 0) {
          console.log('First page:', data.questions.pages[0]);
          if (data.questions.pages[0].elements) {
            console.log('First page elements:', data.questions.pages[0].elements);
            data.questions.pages[0].elements.forEach((element: any, index: number) => {
              console.log(`Element ${index}:`, element);
            });
          }
        }
        
        setSurveyJson(data.questions || {});
        setSurveyTitle(data.title || '');
        setSurveyDescription(data.description || '');
      } catch (error) {
        toast({
          title: 'Errore',
          description: 'Impossibile caricare il questionario',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuestionnaire();
  }, [id, toast]);

  // Early returns after all hooks are called
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

  if (!surveyJson || !surveyModel) {
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

  // Save as Draft handler
  const handleSaveDraft = () => {
    if (!surveyModel) return;
    const data = surveyModel.data;
    // TODO: Send to backend
    toast({
      title: 'Bozza salvata',
      description: 'Le risposte sono state salvate in bozza (simulato).',
    });
    console.log('Draft data:', data);
  };

  return (
    <div className="container mx-auto">
      <style>
        {`
          .lesson-tooltip {
            position: absolute !important;
            z-index: 1000 !important;
            pointer-events: none;
            transition: opacity 0.2s ease;
          }
          
          .lesson-tooltip:hover {
            pointer-events: auto;
          }
          
          .guide-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-left: 0.5rem !important;
            width: 1.5rem !important;
            height: 1.5rem !important;
            border-radius: 9999px !important;
            background-color: rgb(243 232 255) !important;
            color: rgb(147 51 234) !important;
            transition: background-color 0.2s ease !important;
          }
          
          .guide-button:hover {
            background-color: rgb(233 213 255) !important;
          }
          
          .sv-question {
            position: relative !important;
          }
        `}
      </style>
      <MainNavigation variant="questionnaire" title={surveyTitle} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{surveyTitle}</h1>
        {surveyDescription && <p className="text-gray-600 mb-6">{surveyDescription}</p>}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
            {surveyModel ? (
              <Survey ref={surveyRef} model={surveyModel} />
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={handleSaveDraft}>
                Salva in bozza
              </Button>
            </div>
          </div>
          {/* Lesson Sidebar (desktop) */}
          {isDesktop && (
            <div className="w-full lg:w-80">
              {currentLesson && (
                <div className="bg-yellow-50 p-4 rounded-md min-h-[80px] flex flex-col justify-start items-center shadow">
                  <span className="font-medium mb-2">Approfondimento</span>
                  <div className="mt-2 w-full">
                    <p className="text-sm text-yellow-800 text-center">{currentLesson}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Lesson below on mobile */}
        {!isDesktop && currentLesson && (
          <div className="mt-6">
            <div className="bg-yellow-50 p-4 rounded-md min-h-[80px] flex flex-col justify-start items-center shadow">
              <span className="font-medium mb-2">Approfondimento</span>
              <div className="mt-2 w-full">
                <p className="text-sm text-yellow-800 text-center">{currentLesson}</p>
              </div>
            </div>
          </div>
        )}
      </div>
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
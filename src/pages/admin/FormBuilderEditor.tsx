import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-creator-core/survey-creator-core.css';
import 'survey-core/survey-core.css';
import { Serializer } from 'survey-core';

export default function FormBuilderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const creatorRef = useRef<SurveyCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Configure custom properties
  useEffect(() => {
    // Add 'guide' property to all questions
    if (!Serializer.findProperty('question', 'guide')) {
      Serializer.addProperty('question', {
        name: 'guide:text',
        displayName: 'Guide',
        category: 'Custom Properties',
        visibleIndex: 100,
        isRequired: false,
      });
    }

    // Add 'lesson' property to all questions
    if (!Serializer.findProperty('question', 'lesson')) {
      Serializer.addProperty('question', {
        name: 'lesson:text',
        displayName: 'Lesson',
        category: 'Custom Properties',
        visibleIndex: 101,
        isRequired: false,
      });
    }

    // Add 'image' property to all questions
    if (!Serializer.findProperty('question', 'image')) {
      Serializer.addProperty('question', {
        name: 'image:text',
        displayName: 'Question Image URL',
        category: 'Custom Properties',
        visibleIndex: 102,
        isRequired: false,
      });
    }

    // Add 'score' property to choices - this will appear in the Choice table
    if (!Serializer.findProperty('itemvalue', 'score')) {
      Serializer.addProperty('itemvalue', {
        name: 'score:number',
        displayName: 'Score (Points)',
        category: 'general',
        visibleIndex: 3, // This will place it right after text and value in the Choice table
        minValue: 0,
        maxValue: 100,
        default: 0,
        isRequired: false,
      });
    }

    // Also add score property to question level for total score display
    if (!Serializer.findProperty('question', 'showScores')) {
      Serializer.addProperty('question', {
        name: 'showScores:boolean',
        displayName: 'Show Answer Scores',
        category: 'Custom Properties',
        visibleIndex: 103,
        default: false,
      });
    }

    // Add 'description' property to all questions if not already present
    if (!Serializer.findProperty('question', 'description')) {
      Serializer.addProperty('question', {
        name: 'description:text',
        displayName: 'Description',
        category: 'General',
        visibleIndex: 2, // Show after title
        isRequired: false,
      });
    }
  }, []);

  if (!creatorRef.current) {
    creatorRef.current = new SurveyCreator({
      showToolbox: true,
      showLogicTab: true,
      isAutoSave: false,
      showTranslationTab: false,
      showThemeTab: true,
      showTestSurveyTab: true,
      showJSONEditorTab: true,
      showPropertyGrid: true,
      showOptions: true,
      allowDefaultToolboxItems: true,
      allowModifyPages: true,
      allowModifyQuestions: true,
      allowModifyChoices: true,
      allowModifySurvey: true,
    });
  }

  // Load existing form if editing
  useEffect(() => {
    const loadForm = async () => {
      // Only try to load if we have a valid numeric ID (not 'new' or undefined)
      if (id && id !== 'new' && !isNaN(Number(id))) {
        try {
          setLoading(true);
          const response = await fetch(`/api/forms/${id}`);
          if (!response.ok) {
            throw new Error('Form not found');
          }
          const result = await response.json();
          
          if (result.success && result.data) {
            const form = result.data;
            // Set the form data in SurveyJS Creator
            creatorRef.current.JSON = form.questions || {};
            // Set form title and description
            creatorRef.current.survey.title = form.title || '';
            creatorRef.current.survey.description = form.description || '';
          }
        } catch (error) {
          console.error('Error loading form:', error);
          toast({
            title: 'Errore',
            description: 'Impossibile caricare il form: ' + error.message,
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      } else {
        // For new forms, just set loading to false without trying to fetch
        setLoading(false);
      }
    };

    loadForm();
  }, [id, toast]);

  // Save handler
  const handleSave = async () => {
    const creator = creatorRef.current;
    if (!creator) return;

    try {
      setSaving(true);
      
      const surveyJSON = creator.JSON;
      const formData = {
        id: id && id !== 'new' && !isNaN(Number(id)) ? id : undefined,
        title: creator.survey.title || 'Untitled Form',
        description: creator.survey.description || '',
        surveyJSON: surveyJSON,
        status: 'draft',
        createdBy: 'admin' // You can get this from your auth context
      };

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Form salvato',
          description: result.message,
        });
        
        // If this was a new form, navigate to the edit URL
        if (!id || id === 'new' || isNaN(Number(id))) {
          // Small delay to ensure the state is properly updated
          setTimeout(() => {
            navigate(`/admin/form-builder/edit/${result.id}`);
          }, 100);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante il salvataggio: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Publish handler
  const handlePublish = async () => {
    const creator = creatorRef.current;
    if (!creator) return;

    try {
      setPublishing(true);
      
      const surveyJSON = creator.JSON;
      const formData = {
        id: id && id !== 'new' && !isNaN(Number(id)) ? id : undefined,
        title: creator.survey.title || 'Untitled Form',
        description: creator.survey.description || '',
        surveyJSON: surveyJSON,
        status: 'published',
        createdBy: 'admin' // You can get this from your auth context
      };

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Form pubblicato',
          description: result.message,
        });
        
        // If this was a new form, navigate to the edit URL
        if (!id || id === 'new' || isNaN(Number(id))) {
          // Small delay to ensure the state is properly updated
          setTimeout(() => {
            navigate(`/admin/form-builder/edit/${result.id}`);
          }, 100);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error publishing form:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante la pubblicazione: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Caricamento form...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {id && id !== 'new' && !isNaN(Number(id)) ? 'Modifica Form' : 'Nuovo Form'} (SurveyJS)
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salva Form'}
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={publishing || saving}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            {publishing ? 'Pubblicando...' : 'Pubblica Form'}
          </Button>
        </div>
      </div>
      <SurveyCreatorComponent creator={creatorRef.current} />
    </div>
  );
}
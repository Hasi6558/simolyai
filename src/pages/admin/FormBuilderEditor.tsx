import React, { useRef, useEffect } from 'react';
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

  // Add custom properties for guide, lesson, image, and score
  useEffect(() => {
    if (!Serializer.findProperty('question', 'guide')) {
      Serializer.addProperty('question', {
        name: 'guide:text',
        category: 'general',
        visibleIndex: 100,
        displayName: 'Guide',
      });
    }
    if (!Serializer.findProperty('question', 'lesson')) {
      Serializer.addProperty('question', {
        name: 'lesson:text',
        category: 'general',
        visibleIndex: 101,
        displayName: 'Lesson',
      });
    }
    if (!Serializer.findProperty('itemvalue', 'score')) {
      Serializer.addProperty('itemvalue', {
        name: 'score:number',
        displayName: 'Score',
        category: 'general',
        visibleIndex: 102,
      });
    }
    if (!Serializer.findProperty('itemvalue', 'image')) {
      Serializer.addProperty('itemvalue', {
        name: 'image:text',
        displayName: 'Image URL',
        category: 'general',
        visibleIndex: 103,
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
    });
  }

  // Save handler (replace with your API logic)
  const handleSave = () => {
    const creator = creatorRef.current;
    if (creator) {
      const surveyJSON = creator.JSON;
      // TODO: Save surveyJSON to your backend
      toast({
        title: 'Form salvato',
        description: 'Il form è stato salvato con successo!',
      });
      navigate('/admin/form-builder');
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Form Builder (SurveyJS)</h1>
        <Button onClick={handleSave}>Salva Form</Button>
      </div>
      <SurveyCreatorComponent creator={creatorRef.current} />
    </div>
  );
}
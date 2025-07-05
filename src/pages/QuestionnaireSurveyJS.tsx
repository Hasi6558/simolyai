import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { HelpCircle, BookOpen, Image as ImageIcon, Star } from 'lucide-react';
import 'survey-core/survey-core.css';

export default function QuestionnaireSurveyJS() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) {
        setError('Form ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/forms/${id}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error('Invalid form data');
        }

        const formData = result.data;
        
        // Create SurveyJS survey from the stored JSON
        const surveyJson = formData.surveyJSON || {};
        const surveyInstance = new Model(surveyJson);
        
        // Set up survey events
        surveyInstance.onComplete.add((sender, options) => {
          console.log('Survey completed:', sender.data);
          // Here you can send the results to your backend
          alert('Survey completed! Check console for results.');
        });

        // Custom rendering for questions with custom properties
        surveyInstance.onAfterRenderQuestion.add((sender, options) => {
          const question = options.question;
          const questionElement = options.htmlElement;
          
          if (!questionElement) return;

          // Add custom properties display
          const customPropsContainer = document.createElement('div');
          customPropsContainer.className = 'custom-props-container mt-4 p-4 bg-gray-50 rounded-lg';
          
          let hasCustomProps = false;

          // Add guide if present
          if (question.guide) {
            hasCustomProps = true;
            const guideDiv = document.createElement('div');
            guideDiv.className = 'guide-container mb-3';
            guideDiv.innerHTML = `
              <div class="flex items-center gap-2 text-blue-600 mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium text-sm">Guide</span>
              </div>
              <p class="text-sm text-gray-700">${question.guide}</p>
            `;
            customPropsContainer.appendChild(guideDiv);
          }

          // Add lesson if present
          if (question.lesson) {
            hasCustomProps = true;
            const lessonDiv = document.createElement('div');
            lessonDiv.className = 'lesson-container mb-3';
            lessonDiv.innerHTML = `
              <div class="flex items-center gap-2 text-yellow-600 mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span class="font-medium text-sm">Lesson</span>
              </div>
              <p class="text-sm text-gray-700">${question.lesson}</p>
            `;
            customPropsContainer.appendChild(lessonDiv);
          }

          // Add image if present
          if (question.image) {
            hasCustomProps = true;
            const imageDiv = document.createElement('div');
            imageDiv.className = 'question-image-container mb-3';
            imageDiv.innerHTML = `
              <div class="flex items-center gap-2 text-green-600 mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="font-medium text-sm">Question Image</span>
              </div>
              <img src="${question.image}" alt="Question" class="max-w-full h-auto rounded-lg shadow-sm" />
            `;
            customPropsContainer.appendChild(imageDiv);
          }

          // Add score information for choice questions
          if (question.choices && question.choices.length > 0) {
            const hasScores = question.choices.some(choice => choice.score !== undefined && choice.score !== null && choice.score > 0);
            const showScores = question.showScores !== false; // Default to true unless explicitly set to false
            
            if (hasScores && showScores) {
              hasCustomProps = true;
              const scoresDiv = document.createElement('div');
              scoresDiv.className = 'scores-container mb-3';
              
              // Calculate total possible score
              const totalScore = question.choices.reduce((sum, choice) => {
                return sum + (choice.score || 0);
              }, 0);
              
              scoresDiv.innerHTML = `
                <div class="flex items-center gap-2 text-purple-600 mb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-medium text-sm">Answer Scores (Total: ${totalScore} points)</span>
                </div>
                <div class="text-xs text-gray-600 space-y-1">
                  ${question.choices.map(choice => 
                    choice.score !== undefined && choice.score !== null && choice.score > 0
                      ? `<div class="flex justify-between">
                          <span>${choice.text}</span>
                          <span class="font-medium text-purple-600">${choice.score} points</span>
                        </div>`
                      : ''
                  ).filter(text => text).join('')}
                </div>
              `;
              customPropsContainer.appendChild(scoresDiv);
            }
          }

          // Only add the container if there are custom properties
          if (hasCustomProps) {
            questionElement.appendChild(customPropsContainer);
          }

          // Add hover functionality for lesson display in sidebar
          if (question.lesson) {
            questionElement.addEventListener('mouseenter', () => {
              const sidebar = document.getElementById('lesson-sidebar');
              if (sidebar) {
                sidebar.innerHTML = `
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="font-medium text-yellow-800 mb-2">${question.title || 'Question'}</h4>
                    <p class="text-yellow-700">${question.lesson}</p>
                  </div>
                `;
              }
            });

            questionElement.addEventListener('mouseleave', () => {
              const sidebar = document.getElementById('lesson-sidebar');
              if (sidebar) {
                sidebar.innerHTML = '<p class="text-gray-500 italic">Hover over questions to see lesson information here.</p>';
              }
            });
          }
        });

        setSurvey(surveyInstance);
      } catch (err) {
        console.error('Error loading form:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No survey data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Survey Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Survey model={survey} />
            </div>
          </div>
          
          {/* Sidebar for Lesson Display */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-600" />
                Lesson Information
              </h3>
              <div id="lesson-sidebar" className="text-sm text-gray-600">
                <p className="text-gray-500 italic">Hover over questions to see lesson information here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
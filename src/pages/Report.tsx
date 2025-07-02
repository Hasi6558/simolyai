
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchReportById, ReportData } from '@/services/report';
import ShortcodeProcessor, { ShortcodeMap } from '@/components/report-components/ShortcodeProcessor';
import { fetchLatestReportTemplate } from '@/services/report';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);
  const [template, setTemplate] = useState<string | null>(null);

  useEffect(() => {
    const loadReportAndTemplate = async () => {
      setLoading(true);
      try {
        if (!id) {
          throw new Error('ID del report non specificato');
        }

        // Carica il report
        const reportData = await fetchReportById(id);
        if (!reportData) {
          throw new Error('Report non trovato');
        }

        // Carica il template
        const templateContent = await fetchLatestReportTemplate();
        
        setReport(reportData);
        setTemplate(templateContent || 'Nessun template disponibile. Configura un template per il report.');
      } catch (error) {
        console.error('Error loading report:', error);
        toast({
          title: "Errore",
          description: error.message || "Si è verificato un errore nel caricamento del report",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadReportAndTemplate();
  }, [id, toast]);

  // Prepara la mappa degli shortcode per il rendering
  const prepareShortcodeMap = (): ShortcodeMap => {
    if (!report) return { text: {}, charts: {}, tables: {} };
    
    return {
      text: report.textSections || {},
      charts: report.chartSections || {},
      tables: report.tableSections || {}
    };
  };

  // Gestisce la visualizzazione legacy (retrocompatibilità)
  const renderLegacyReport = () => {
    if (!report?.sections || report.sections.length === 0) {
      return <p>Questo report non contiene sezioni.</p>;
    }

    return (
      <div className="space-y-6">
        {report.sections.map((section, index) => (
          <div key={index} className="card bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">{section.title}</h3>
            
            {section.type === 'text' && (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            )}
            
            {(section.type === 'bar-chart' || section.type === 'pie-chart') && section.chartData && (
              <div>
                <p>{section.content}</p>
                <div className="mt-4 h-80 bg-gray-100 flex items-center justify-center">
                  <p>[{section.type.toUpperCase()}]</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-simoly-purple mx-auto"></div>
          <p className="mt-4">Caricamento report in corso...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Report non trovato</h1>
        <p className="mb-8">Il report richiesto non esiste o non è accessibile.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Torna alla Dashboard
        </Button>
      </div>
    );
  }

  const shortcodeMap = prepareShortcodeMap();
  const isShortcodeBased = Object.keys(shortcodeMap.text).length > 0 || 
                          Object.keys(shortcodeMap.charts).length > 0 || 
                          Object.keys(shortcodeMap.tables).length > 0;

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate('/dashboard')}
      >
        ← Torna alla Dashboard
      </Button>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {report.title || "Report di Analisi Personalizzato"}
        </h1>
        
        {report.date && (
          <p className="text-center text-gray-500 mb-8">
            Generato il {new Date(report.date).toLocaleDateString('it-IT')}
          </p>
        )}
        
        <div className="divider my-8"></div>
        
        {isShortcodeBased && template ? (
          <ShortcodeProcessor 
            content={template} 
            shortcodeMap={shortcodeMap} 
          />
        ) : (
          renderLegacyReport()
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => navigate('/dashboard')}
        >
          Torna alla Dashboard
        </Button>
        <Button 
          variant="default"
          onClick={() => window.print()}
        >
          Stampa Report
        </Button>
      </div>
    </div>
  );
};

export default Report;

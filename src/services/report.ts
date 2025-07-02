import { supabase } from "@/integrations/supabase/client";

export type UserReport = {
  id: string;
  questionnaire_id: string;
  created_at: string;
  title: string;
  pdf_url: string | null;
  user_id: string;
  content: ReportData;
};

export type ReportData = {
  title?: string;
  date?: string;
  sections?: {
    title: string;
    content: string;
    type: 'text' | 'bar-chart' | 'pie-chart';
    chartData?: any[];
  }[];
  textSections?: Record<string, string>;
  chartSections?: Record<string, any>;
  tableSections?: Record<string, any>;
};

export const fetchReportsByUser = async (userId: string): Promise<UserReport[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as UserReport[] || [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const fetchReportById = async (reportId: string): Promise<ReportData | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    return data.content as ReportData;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
};

export const saveReportTemplate = async (template: { title: string; content: string; description?: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_templates')
      .insert({
        title: template.title,
        content: template.content,
        description: template.description,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving report template:', error);
    return false;
  }
};

export const fetchLatestReportTemplate = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    return data?.content || null;
  } catch (error) {
    console.error('Error fetching report template:', error);
    return null;
  }
};

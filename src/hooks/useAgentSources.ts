
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface SourceItem {
  id: string;
  agent_id: string;
  user_id: string;
  type: string;
  content: string;
  chars: number;
  created_at: string;
}

export const useAgentSources = (agentId: string | undefined) => {
  const { user } = useAuth();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isProcessingSource, setIsProcessingSource] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchSources();
    }
  }, [agentId]);

  const fetchSources = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setSources(data || []);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast.error("Failed to load sources");
    } finally {
      setIsLoading(false);
    }
  };

  const processSourceWithOpenAI = async (sourceId: string, fileBase64?: string) => {
    if (!agentId) return;
    
    setIsProcessingSource(true);
    
    try {
      const processResponse = await supabase.functions.invoke('process-agent-source', {
        body: { 
          sourceId, 
          agentId,
          operation: 'add',
          fileBase64
        }
      });
      
      if (processResponse.error) {
        console.error("Error processing source with OpenAI:", processResponse.error);
        throw new Error(processResponse.error.message || "Failed to process source with OpenAI");
      }
      
      console.log("Source processed successfully:", processResponse.data);
      return processResponse.data;
    } catch (error: any) {
      console.error("Error processing source with OpenAI:", error);
      throw error;
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleAddText = async (text: string) => {
    if (!agentId || !user) return;
    
    try {
      // Estimate character count
      const chars = text.length;
      
      const { data, error } = await supabase
        .from("agent_sources")
        .insert([{
          agent_id: agentId,
          user_id: user.id,
          type: "text",
          content: text,
          chars: chars
        }])
        .select();
        
      if (error) throw error;
      
      if (data) {
        const newSources = data as SourceItem[];
        setSources(prev => [...newSources, ...prev]);
        
        // Process the new source with OpenAI
        try {
          const sourceId = newSources[0].id;
          await processSourceWithOpenAI(sourceId);
          toast.success("Text added and processed successfully");
        } catch (processError: any) {
          console.error("Error processing text with OpenAI:", processError);
          toast.warning("Text added to database but failed to process with OpenAI");
        }
      }
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text");
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddFiles = async (files: File[]) => {
    if (!agentId || !user) return;
    
    try {
      for (const file of files) {
        // First, read the file as base64
        const fileBase64 = await readFileAsBase64(file);
        
        const { data, error } = await supabase
          .from("agent_sources")
          .insert([{
            agent_id: agentId,
            user_id: user.id,
            type: "file",
            content: file.name,
            chars: Math.floor(file.size / 4) // Rough estimate of character count
          }])
          .select();
          
        if (error) throw error;
        
        if (data) {
          const newSources = data as SourceItem[];
          setSources(prev => [...newSources, ...prev]);
          
          // Process the new source with OpenAI, passing the file content
          try {
            const sourceId = newSources[0].id;
            await processSourceWithOpenAI(sourceId, fileBase64);
            toast.success(`${file.name} added and processed successfully`);
          } catch (processError: any) {
            console.error(`Error processing file ${file.name} with OpenAI:`, processError);
            toast.warning(`${file.name} added to database but failed to process with OpenAI: ${processError.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error adding files:", error);
      toast.error(`Failed to add files: ${error.message}`);
    }
  };

  const handleRetrainAgent = async () => {
    if (!agentId) return;
    
    setIsRetraining(true);
    
    try {
      const retrainResponse = await supabase.functions.invoke('retrain-agent', {
        body: { agentId }
      });
      
      if (retrainResponse.error) {
        console.error("Error retraining agent:", retrainResponse.error);
        throw new Error(retrainResponse.error.message || "Failed to retrain agent");
      }
      
      console.log("Agent retrained successfully:", retrainResponse.data);
      toast.success("Agent retrained successfully");
    } catch (error: any) {
      console.error("Error retraining agent:", error);
      toast.error(error.message || "Failed to retrain agent");
    } finally {
      setIsRetraining(false);
    }
  };

  // Calculate stats from sources
  const getSourceStats = () => {
    const filesSources = sources.filter(s => s.type === "file");
    const textSources = sources.filter(s => s.type === "text");
    const websiteSources = sources.filter(s => s.type === "website");
    const qaSources = sources.filter(s => s.type === "qa");
    
    const fileChars = filesSources.reduce((sum, item) => sum + (item.chars || 0), 0);
    const textChars = textSources.reduce((sum, item) => sum + (item.chars || 0), 0);
    const websiteChars = websiteSources.reduce((sum, item) => sum + (item.chars || 0), 0);
    const qaChars = qaSources.reduce((sum, item) => sum + (item.chars || 0), 0);
    const totalChars = fileChars + textChars + websiteChars + qaChars;

    return {
      filesSources,
      textSources,
      websiteSources,
      qaSources,
      fileChars,
      textChars,
      websiteChars,
      qaChars,
      totalChars
    };
  };

  return {
    sources,
    isLoading,
    isRetraining,
    handleAddText,
    handleAddFiles,
    handleRetrainAgent,
    getSourceStats
  };
};

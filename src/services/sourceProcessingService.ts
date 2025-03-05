
import { supabase } from "@/integrations/supabase/client";

/**
 * Process a source with OpenAI through the edge function
 */
export const processSourceWithOpenAI = async (sourceId: string, agentId: string, fileBase64?: string) => {
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
  }
};

/**
 * Utility function to read a file as base64
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
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

/**
 * Retrain an agent with all its sources
 */
export const retrainAgent = async (agentId: string) => {
  try {
    const retrainResponse = await supabase.functions.invoke('retrain-agent', {
      body: { agentId }
    });
    
    if (retrainResponse.error) {
      console.error("Error retraining agent:", retrainResponse.error);
      throw new Error(retrainResponse.error.message || "Failed to retrain agent");
    }
    
    console.log("Agent retrained successfully:", retrainResponse.data);
    return retrainResponse.data;
  } catch (error: any) {
    console.error("Error retraining agent:", error);
    throw error;
  }
};


import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch source data with retry mechanism and exponential backoff
 */
export const fetchSourceWithRetry = async (
  sourceId: string,
  retries = 3,
  backoff = 300
): Promise<{ data: any, error: any }> => {
  try {
    const { data, error } = await supabase
      .from("agent_sources")
      .select("content, chars")
      .eq("id", sourceId)
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.log(`Fetch attempt failed for source ${sourceId}:`, error);
    
    if (retries <= 0) {
      console.error(`All retries failed for source ${sourceId}`);
      return { data: null, error };
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, backoff));
    
    // Recursive retry with increased backoff
    console.log(`Retrying fetch for source ${sourceId}. Retries left: ${retries-1}`);
    return fetchSourceWithRetry(sourceId, retries - 1, backoff * 2);
  }
};

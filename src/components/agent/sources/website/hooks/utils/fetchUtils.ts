
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../../WebsiteItem";

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

/**
 * Fetch all website sources for an agent, excluding deleted sources
 */
export const fetchCrawledWebsites = async (
  agentId: string,
  deletedIds: Set<string>
): Promise<WebsiteSourceItem[]> => {
  try {
    const { data, error } = await supabase
      .from("agent_sources")
      .select("*")
      .eq("agent_id", agentId)
      .eq("type", "website");
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Convert database rows to WebsiteSourceItem objects
    // Filter out any sources that are in the deletedIds set
    return data
      .filter(source => !deletedIds.has(source.id))
      .map(source => {
        let content;
        try {
          content = JSON.parse(source.content);
        } catch (e) {
          console.error("Error parsing content for source:", source.id);
          content = {};
        }
        
        return {
          sourceId: source.id,
          url: content.url || "",
          status: content.status || "completed",
          count: content.pages_crawled || 0,
          chars: source.chars || 0,
          error: content.error,
          crawlReport: content.crawl_report,
          debugLogs: content.logs || [],
          requestedLimit: content.requested_limit,
          timestamp: source.created_at
        };
      });
  } catch (error) {
    console.error("Error fetching crawled websites:", error);
    return [];
  }
};

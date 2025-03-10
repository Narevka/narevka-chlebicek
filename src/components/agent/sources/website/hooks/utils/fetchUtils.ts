
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../../WebsiteItem";

/**
 * Fetch all crawled websites for a specific agent
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
      .eq("type", "website")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Filter out deleted sources
    const filteredData = data.filter(source => !deletedIds.has(source.id));
    
    // Map to WebsiteSourceItem format
    return filteredData.map(source => {
      let parsedContent: any = {};
      
      try {
        parsedContent = JSON.parse(source.content);
      } catch (e) {
        console.error("Error parsing content:", e);
      }
      
      return {
        url: parsedContent.url || "Unknown URL",
        count: parsedContent.pages_crawled || 0,
        sourceId: source.id,
        status: parsedContent.status || "completed",
        error: parsedContent.error,
        chars: source.chars || 0
      };
    });
  } catch (error) {
    console.error("Error fetching crawled websites:", error);
    return [];
  }
};

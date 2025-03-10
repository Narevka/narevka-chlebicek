
import { supabase } from "@/integrations/supabase/client";
import { SourceItem, SourceStats } from "@/types/sources";
import { toast } from "sonner";

/**
 * Fetch all sources for an agent
 */
export const fetchAgentSources = async (agentId: string): Promise<SourceItem[]> => {
  if (!agentId) return [];
  
  try {
    const { data, error } = await supabase
      .from("agent_sources")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching sources:", error);
    toast.error("Failed to load sources");
    return [];
  }
};

/**
 * Calculate source statistics
 */
export const calculateSourceStats = (sources: SourceItem[]): SourceStats => {
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


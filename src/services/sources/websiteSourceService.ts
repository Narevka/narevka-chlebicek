
import { supabase } from "@/integrations/supabase/client";
import { SourceItem } from "@/types/sources";
import { toast } from "sonner";
import { CrawlOptions } from "@/hooks/useAgentSources";
import { fetchAgentSources } from "./baseSourceService";

export const addWebsiteSource = async (
  agentId: string, 
  userId: string, 
  url: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void,
  options?: CrawlOptions
): Promise<string> => {
  try {
    const { data: crawlResponse, error: crawlError } = await supabase.functions.invoke('crawl-website', {
      body: { 
        url,
        agentId,
        userId,
        limit: options?.limit || 5,
        returnFormat: options?.returnFormat || "markdown",
        requestType: options?.requestType || "smart",
        enableProxies: options?.enableProxies || false,
        enableMetadata: options?.enableMetadata !== undefined ? options.enableMetadata : true,
        enableAntiBot: options?.enableAntiBot || false,
        enableFullResources: options?.enableFullResources || false,
        enableSubdomains: options?.enableSubdomains || false,
        enableTlds: options?.enableTlds || false
      }
    });
    
    if (crawlError) {
      console.error("Crawl error:", crawlError);
      throw new Error(crawlError.message || "Failed to crawl website");
    }
    
    if (!crawlResponse.success) {
      console.error("Crawl response error:", crawlResponse.error);
      throw new Error(crawlResponse.error || "Failed to crawl website");
    }
    
    const refreshedSources = await fetchAgentSources(agentId);
    setSourcesCallback(refreshedSources);
    
    const sourceId = crawlResponse.sourceId;
    
    if (!sourceId) {
      throw new Error("Failed to get source ID from crawl response");
    }
    
    // Usuwamy powiadomienie sukcesu stąd, bo będzie ono wyświetlane tylko po faktycznym zakończeniu crawlowania
    // przez useCrawlStatusChecker
    
    return sourceId;
  } catch (error: any) {
    console.error("Error adding website:", error);
    toast.error(`Failed to add website: ${error.message}`);
    throw error;
  }
};

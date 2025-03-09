
import { useState } from "react";
import { toast } from "sonner";
import { CrawlOptions } from "../CrawlOptions";
import { WebsiteSourceItem } from "../WebsiteItem";

interface UseCrawlWebsiteProps {
  agentId?: string;
  handleAddWebsite: (url: string, options?: CrawlOptions) => Promise<string>;
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  localStorageKey: string;
  setLastCheckTime: (time: number) => void;
}

export const useCrawlWebsite = ({
  agentId,
  handleAddWebsite,
  includedLinks,
  setIncludedLinks,
  localStorageKey,
  setLastCheckTime
}: UseCrawlWebsiteProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCrawlWebsite = async (url: string, crawlOptions: CrawlOptions) => {
    if (!agentId) {
      toast.error("Missing agent ID");
      return;
    }

    setIsLoading(true);
    
    try {
      // Call handleAddWebsite from useAgentSources hook with advanced options
      const sourceId = await handleAddWebsite(url, crawlOptions);
      
      if (!sourceId) {
        throw new Error("Failed to get source ID");
      }
      
      // Add URL to list
      const newLink: WebsiteSourceItem = { 
        url, 
        count: 0, 
        sourceId,
        status: 'crawling',
        chars: 0
      };
      
      const updatedLinks = [newLink, ...includedLinks];
      setIncludedLinks(updatedLinks);
      
      // Store in local storage to persist across page refreshes
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
      
      toast.success("Website crawl started");
      
      // Force an immediate check after a short delay to update UI
      setTimeout(() => setLastCheckTime(Date.now()), 2000);
    } catch (error: any) {
      console.error("Error starting crawl:", error);
      toast.error(`Failed to start crawl: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleCrawlWebsite
  };
};

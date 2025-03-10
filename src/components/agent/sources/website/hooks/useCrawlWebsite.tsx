
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

    // Prevent duplicate crawls of the same URL with active crawling status
    const existingCrawl = includedLinks.find(
      link => link.url === url && link.status === 'crawling'
    );
    
    if (existingCrawl) {
      toast.error("This URL is already being crawled");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Starting crawl for ${url} with options:`, crawlOptions);
      
      // Call handleAddWebsite from useAgentSources hook with advanced options
      const sourceId = await handleAddWebsite(url, crawlOptions);
      
      if (!sourceId) {
        throw new Error("Failed to get source ID");
      }
      
      console.log(`Crawl initiated with sourceId: ${sourceId}`);
      
      // Add URL to list with detailed options info
      const newLink: WebsiteSourceItem = { 
        url, 
        count: 0, 
        sourceId,
        status: 'crawling',
        chars: 0,
        requestedLimit: crawlOptions.limit,
        crawlOptions: crawlOptions,
        notificationShown: false, // Flag to track if completion notification was shown
        createdAt: new Date().toISOString() // Using the newly added property
      };
      
      const updatedLinks = [newLink, ...includedLinks];
      setIncludedLinks(updatedLinks);
      
      // Store in local storage to persist across page refreshes
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
      
      // Use a discrete toast ID to prevent duplicate toasts
      toast.success("Website crawl started", { id: `crawl-started-${sourceId}` });
      console.log(`Website crawl started for ${url} with limit ${crawlOptions.limit}`);
      
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

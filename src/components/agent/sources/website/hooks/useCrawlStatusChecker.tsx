
import { useState, useEffect } from "react";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";
import { checkSourceStatus } from "./utils/crawlStatusService";

interface UseCrawlStatusCheckerProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  deletedSourceIds: Set<string>;
  lastCheckTime: number;
  setLastCheckTime: (time: number) => void;
  localStorageKey: string;
}

export const useCrawlStatusChecker = ({
  includedLinks,
  setIncludedLinks,
  deletedSourceIds,
  lastCheckTime,
  setLastCheckTime,
  localStorageKey
}: UseCrawlStatusCheckerProps) => {
  
  // Effect to periodically check the status of crawling sources
  useEffect(() => {
    const crawlingSources = includedLinks.filter(link => 
      link.status === 'crawling' && !deletedSourceIds.has(link.sourceId || '')
    );
    
    if (crawlingSources.length === 0) return;

    const checkCrawlStatus = async () => {
      console.log("Checking crawl status for", crawlingSources.length, "sources");
      setLastCheckTime(Date.now());
      
      const updatedLinks = [...includedLinks];
      let hasChanges = false;

      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i];
        
        if (link.status === 'crawling' && link.sourceId && !deletedSourceIds.has(link.sourceId)) {
          try {
            const result = await checkSourceStatus(link.sourceId, link);
            
            if (result.hasChanges && result.updatedLink) {
              updatedLinks[i] = result.updatedLink;
              hasChanges = true;
            }
          } catch (error) {
            console.error("Error checking source status:", error);
          }
        }
      }

      if (hasChanges) {
        setIncludedLinks(updatedLinks);
        
        // Update local storage to persist state across page refreshes
        localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
      }
    };

    // Check immediately when this effect runs
    checkCrawlStatus();
    
    // Then set up the interval for future checks
    const intervalId = setInterval(checkCrawlStatus, 8000); // Pozostawiamy 8 sekund
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [includedLinks, lastCheckTime, deletedSourceIds, setIncludedLinks, setLastCheckTime, localStorageKey]);

  // Check crawl status manually
  const handleCheckStatus = async (sourceId: string, index: number) => {
    if (!sourceId) return;
    
    try {
      const link = includedLinks[index];
      const result = await checkSourceStatus(sourceId, link);
      
      if (result.hasChanges && result.updatedLink) {
        const newLinks = [...includedLinks];
        newLinks[index] = result.updatedLink;
        
        setIncludedLinks(newLinks);
        
        // Update local storage
        localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
      }
      
      // Show status message
      if (result.message) {
        if (result.message === 'completed') {
          toast.success(`Crawl has completed`);
        } else if (result.message === 'error') {
          toast.error(`Crawl error: ${result.updatedLink?.error}`);
        } else if (result.message === 'crawling') {
          toast.info("Crawl is still in progress");
        }
      }
    } catch (error: any) {
      console.error("Error checking status:", error);
      toast.error(`Failed to check status: ${error.message}`);
    }
  };

  return {
    handleCheckStatus
  };
};

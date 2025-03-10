
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";

interface UseCrawlStatusCheckerProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  deletedSourceIds: Set<string>;
  lastCheckTime: number;
  setLastCheckTime: (time: number) => void;
  localStorageKey: string;
}

// Utility function for fetch retry with exponential backoff
const fetchWithRetry = async (
  sourceId: string,
  retries = 3,
  backoff = 300
) => {
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
    return fetchWithRetry(sourceId, retries - 1, backoff * 2);
  }
};

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
            // Use retry mechanism
            const { data, error } = await fetchWithRetry(link.sourceId);
            
            if (error) {
              console.error("Error checking crawl status after retries:", error);
              continue;
            }

            if (data) {
              let content;
              try {
                content = JSON.parse(data.content);
              } catch (e) {
                console.error("Error parsing content:", e);
                continue;
              }

              // Check if status changed
              if (content.status && content.status !== link.status) {
                // Log the full content for debugging
                console.log(`Status change for source ${link.sourceId} (${link.url}):`, content);
                
                // Extract and save crawl report if available
                const crawlReport = content.crawl_report || null;
                
                // Check if we've already shown a notification for this status
                // to avoid duplicate notifications
                const alreadyNotified = updatedLinks[i].notificationShown || false;
                
                updatedLinks[i] = {
                  ...link,
                  status: content.status,
                  error: content.error,
                  count: content.pages_crawled || link.count,
                  chars: data.chars || link.chars,
                  crawlReport: crawlReport,
                  notificationShown: alreadyNotified
                };
                hasChanges = true;

                // Only show notification if it hasn't been shown yet and status is completed or error
                if (content.status === 'completed' && !alreadyNotified) {
                  updatedLinks[i].notificationShown = true; // Mark as shown
                  const limitInfo = link.requestedLimit 
                    ? ` (got ${content.pages_crawled || 0} of ${link.requestedLimit} pages)`
                    : '';
                  toast.success(`Crawl completed for ${link.url}${limitInfo}`);
                  console.log(`Crawl completed for ${link.url}${limitInfo}`);
                } else if (content.status === 'error' && !alreadyNotified) {
                  updatedLinks[i].notificationShown = true; // Mark as shown
                  toast.error(`Crawl failed for ${link.url}: ${content.error}`);
                  console.error(`Crawl failed for ${link.url}: ${content.error}`);
                }
              }
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
    const intervalId = setInterval(checkCrawlStatus, 8000); // Increased to 8 seconds to reduce request frequency
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [includedLinks, lastCheckTime, deletedSourceIds, setIncludedLinks, setLastCheckTime, localStorageKey]);

  // Check crawl status manually
  const handleCheckStatus = async (sourceId: string, index: number) => {
    if (!sourceId) return;
    
    try {
      console.log(`Manually checking status for source ${sourceId}`);
      
      // Use retry mechanism
      const { data, error } = await fetchWithRetry(sourceId);

      if (error) throw error;
      
      if (data && data.content) {
        let content;
        try {
          content = JSON.parse(data.content);
          console.log(`Source ${sourceId} content:`, content);
        } catch (e) {
          toast.error("Could not parse source content");
          return;
        }
        
        // Extract crawl report if available
        const crawlReport = content.crawl_report || null;
        
        // Update the link with current status
        const newLinks = [...includedLinks];
        newLinks[index] = {
          ...newLinks[index],
          status: content.status || newLinks[index].status,
          error: content.error,
          count: content.pages_crawled || newLinks[index].count,
          chars: data.chars || newLinks[index].chars,
          crawlReport: crawlReport,
          notificationShown: true // Mark notification as shown for manual checks
        };
        
        setIncludedLinks(newLinks);
        
        // Update local storage
        localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
        
        // Prepare detailed message
        let detailMsg = '';
        if (crawlReport) {
          detailMsg = ` - ${crawlReport.pagesReceived || 0} pages received`;
          if (newLinks[index].requestedLimit) {
            detailMsg += ` (requested: ${newLinks[index].requestedLimit})`;
          }
        }
        
        if (content.status === 'completed') {
          toast.success(`Crawl has completed${detailMsg}`);
          console.log(`Crawl has completed${detailMsg}`);
        } else if (content.status === 'error') {
          toast.error(`Crawl error: ${content.error}`);
          console.error(`Crawl error: ${content.error}`);
        } else if (content.status === 'crawling') {
          toast.info("Crawl is still in progress");
          console.log("Crawl is still in progress");
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

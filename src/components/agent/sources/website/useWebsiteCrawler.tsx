
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CrawlOptions } from "./CrawlOptions";
import { WebsiteSourceItem } from "./WebsiteItem";

interface UseWebsiteCrawlerProps {
  agentId?: string;
  handleAddWebsite: (url: string, options?: CrawlOptions) => Promise<string>;
}

export const useWebsiteCrawler = ({ agentId, handleAddWebsite }: UseWebsiteCrawlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [includedLinks, setIncludedLinks] = useState<WebsiteSourceItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [deletedSourceIds, setDeletedSourceIds] = useState<Set<string>>(new Set());
  const localStorageKey = `websiteSources-${agentId}`;
  const deletedSourcesKey = `deletedSources-${agentId}`;

  // Load previously crawled websites when component mounts or when route changes
  useEffect(() => {
    if (!agentId) return;
    
    // Load deleted sources IDs from localStorage
    const storedDeletedIds = localStorage.getItem(deletedSourcesKey);
    if (storedDeletedIds) {
      try {
        const parsedIds = JSON.parse(storedDeletedIds);
        setDeletedSourceIds(new Set(parsedIds));
      } catch (e) {
        console.error("Error parsing deleted source IDs:", e);
      }
    }
    
    // Fetch from database to get most up-to-date data
    fetchCrawledWebsites();
  }, [agentId]);

  // Fetch all crawled websites for this agent
  const fetchCrawledWebsites = async () => {
    if (!agentId) return;
    
    try {
      // First, get our current set of deleted IDs
      const storedDeletedIds = localStorage.getItem(deletedSourcesKey);
      let deletedIds = new Set<string>();
      
      if (storedDeletedIds) {
        try {
          const parsedIds = JSON.parse(storedDeletedIds);
          deletedIds = new Set(parsedIds);
          setDeletedSourceIds(deletedIds);
        } catch (e) {
          console.error("Error parsing deleted source IDs:", e);
        }
      }
      
      const { data, error } = await supabase
        .from("agent_sources")
        .select("*")
        .eq("agent_id", agentId)
        .eq("type", "website")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Filter out deleted sources - this is crucial for preventing deleted items from reappearing
        const filteredData = data.filter(source => !deletedIds.has(source.id));
        
        const websiteSources: WebsiteSourceItem[] = filteredData.map(source => {
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
        
        setIncludedLinks(websiteSources);
        
        // Update localStorage for persistence across page refreshes
        localStorage.setItem(localStorageKey, JSON.stringify(websiteSources));
      } else {
        // If no data, ensure we clear the displayed links
        setIncludedLinks([]);
        localStorage.removeItem(localStorageKey);
      }
    } catch (error) {
      console.error("Error fetching crawled websites:", error);
    }
  };

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
            const { data, error } = await supabase
              .from("agent_sources")
              .select("content, chars")
              .eq("id", link.sourceId)
              .single();

            if (error) {
              console.error("Error checking crawl status:", error);
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

              if (content.status && content.status !== link.status) {
                updatedLinks[i] = {
                  ...link,
                  status: content.status,
                  error: content.error,
                  count: content.pages_crawled || link.count,
                  chars: data.chars || link.chars
                };
                hasChanges = true;

                if (content.status === 'completed') {
                  toast.success(`Crawl completed for ${link.url}`);
                } else if (content.status === 'error') {
                  toast.error(`Crawl failed for ${link.url}: ${content.error}`);
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
    const intervalId = setInterval(checkCrawlStatus, 5000); // Check every 5 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [includedLinks, agentId, lastCheckTime, deletedSourceIds]);

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
  
  const handleDeleteLink = async (index: number) => {
    const newLinks = [...includedLinks];
    const linkToDelete = newLinks[index];
    
    // If the link has a sourceId, add it to the deleted sources list
    if (linkToDelete.sourceId) {
      // Update the deletedSourceIds state
      const newDeletedIds = new Set(deletedSourceIds);
      newDeletedIds.add(linkToDelete.sourceId);
      setDeletedSourceIds(newDeletedIds);
      
      // Immediately save to localStorage to ensure persistence
      localStorage.setItem(deletedSourcesKey, JSON.stringify([...newDeletedIds]));
      
      // If the link is being crawled, try to cancel the crawl
      if (linkToDelete.status === 'crawling') {
        try {
          // Attempt to update the source status to cancelled
          const { error } = await supabase
            .from("agent_sources")
            .update({
              content: JSON.stringify({
                url: linkToDelete.url,
                status: 'error',
                error: 'Crawl cancelled by user'
              })
            })
            .eq('id', linkToDelete.sourceId);
            
          if (error) {
            console.error("Error cancelling crawl:", error);
          }
        } catch (error) {
          console.error("Error updating source status:", error);
        }
      }
    }
    
    // Remove from UI
    newLinks.splice(index, 1);
    setIncludedLinks(newLinks);
    
    // Update local storage for the links list
    localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
    
    toast.success("Website source removed");
  };
  
  const handleDeleteAllLinks = () => {
    // Store all sourceIds as deleted
    const newDeletedIds = new Set(deletedSourceIds);
    includedLinks.forEach(link => {
      if (link.sourceId) {
        newDeletedIds.add(link.sourceId);
        
        // If the link is being crawled, try to cancel the crawl
        if (link.status === 'crawling') {
          try {
            // Attempt to update the source status to cancelled - fire and forget
            supabase
              .from("agent_sources")
              .update({
                content: JSON.stringify({
                  url: link.url,
                  status: 'error',
                  error: 'Crawl cancelled by user'
                })
              })
              .eq('id', link.sourceId);
          } catch (error) {
            console.error("Error updating source status:", error);
          }
        }
      }
    });
    
    setDeletedSourceIds(newDeletedIds);
    
    // Save deleted IDs to localStorage IMMEDIATELY to ensure persistence
    localStorage.setItem(deletedSourcesKey, JSON.stringify([...newDeletedIds]));
    
    // Clear the list from UI
    setIncludedLinks([]);
    
    // Clear local storage for links
    localStorage.removeItem(localStorageKey);
    
    toast.success("All website sources have been removed");
  };

  const handleDownloadContent = async (sourceId: string, url: string) => {
    if (!sourceId) {
      toast.error("No source ID to download");
      return;
    }

    setDownloadingId(sourceId);
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content")
        .eq("id", sourceId)
        .single();

      if (error) {
        throw error;
      }

      if (!data || !data.content) {
        toast.error("No content found for this website");
        return;
      }

      // Parse content
      let content = "";
      try {
        const parsedContent = JSON.parse(data.content);
        content = parsedContent.crawled_content || "No content";
      } catch (e) {
        content = data.content;
      }

      // Create file for download
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const urlObject = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObject;
      
      // Prepare filename based on URL
      const domain = new URL(url).hostname;
      a.download = `crawled-content-${domain}.txt`;
      
      // Simulate click to download file
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObject);
      
      toast.success("Download started");
      
      // Log content size for debugging
      console.log(`Downloaded content size: ${content.length} characters`);
    } catch (error: any) {
      console.error("Error downloading content:", error);
      toast.error(`Failed to download content: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleProcessSource = async (sourceId: string, index: number) => {
    if (!sourceId || !agentId) {
      toast.error("Missing source ID or agent ID");
      return;
    }

    // Update state to show processing
    const newLinks = [...includedLinks];
    newLinks[index] = {...newLinks[index], isProcessing: true};
    setIncludedLinks(newLinks);
    
    // Update local storage
    localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
    
    try {
      // Process the source using the process-agent-source function
      const { data: processResponse, error: processError } = await supabase.functions.invoke('process-agent-source', {
        body: { 
          sourceId, 
          agentId,
          operation: 'add'
        }
      });
      
      if (processError) {
        throw new Error(processError.message || "Failed to process source");
      }
      
      toast.success("Website content processed successfully");
      
      // Update state to show processing complete
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
      
      // Update local storage
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
    } catch (error: any) {
      console.error("Error processing source:", error);
      toast.error(`Failed to process source: ${error.message}`);
      
      // Update state to show processing failed
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
      
      // Update local storage
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
    }
  };

  // Check crawl status manually
  const handleCheckStatus = async (sourceId: string, index: number) => {
    if (!sourceId) return;
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content, chars")
        .eq("id", sourceId)
        .single();

      if (error) throw error;
      
      if (data && data.content) {
        let content;
        try {
          content = JSON.parse(data.content);
        } catch (e) {
          toast.error("Could not parse source content");
          return;
        }
        
        // Update the link with current status
        const newLinks = [...includedLinks];
        newLinks[index] = {
          ...newLinks[index],
          status: content.status || newLinks[index].status,
          error: content.error,
          count: content.pages_crawled || newLinks[index].count,
          chars: data.chars || newLinks[index].chars
        };
        
        setIncludedLinks(newLinks);
        
        // Update local storage
        localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
        
        if (content.status === 'completed') {
          toast.success("Crawl has completed");
        } else if (content.status === 'error') {
          toast.error(`Crawl error: ${content.error}`);
        } else if (content.status === 'crawling') {
          toast.info("Crawl is still in progress");
        }
      }
    } catch (error: any) {
      console.error("Error checking status:", error);
      toast.error(`Failed to check status: ${error.message}`);
    }
  };

  // Clear the deleted sources list (for debugging)
  const clearDeletedSources = () => {
    setDeletedSourceIds(new Set());
    localStorage.removeItem(deletedSourcesKey);
  };

  return {
    isLoading,
    includedLinks,
    downloadingId,
    handleCrawlWebsite,
    handleDeleteLink,
    handleDeleteAllLinks,
    handleDownloadContent,
    handleProcessSource,
    handleCheckStatus,
    clearDeletedSources
  };
};


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

  // Load previously crawled websites when component mounts
  useEffect(() => {
    if (!agentId) return;
    
    fetchCrawledWebsites();
  }, [agentId]);

  // Fetch all crawled websites for this agent
  const fetchCrawledWebsites = async () => {
    if (!agentId) return;
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("*")
        .eq("agent_id", agentId)
        .eq("type", "website")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const websiteSources: WebsiteSourceItem[] = data.map(source => {
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
            status: parsedContent.status || "completed"
          };
        });
        
        setIncludedLinks(websiteSources);
      }
    } catch (error) {
      console.error("Error fetching crawled websites:", error);
    }
  };

  // Effect to periodically check the status of crawling sources
  useEffect(() => {
    const crawlingSources = includedLinks.filter(link => link.status === 'crawling');
    if (crawlingSources.length === 0) return;

    const checkCrawlStatus = async () => {
      const updatedLinks = [...includedLinks];
      let hasChanges = false;

      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i];
        
        if (link.status === 'crawling' && link.sourceId) {
          try {
            const { data, error } = await supabase
              .from("agent_sources")
              .select("content")
              .eq("id", link.sourceId)
              .single();

            if (error) {
              console.error("Error checking crawl status:", error);
              continue;
            }

            if (data && data.content) {
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
                  count: content.pages_crawled || link.count
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
        localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(updatedLinks));
      }
    };

    const intervalId = setInterval(checkCrawlStatus, 5000); // Check every 5 seconds
    return () => clearInterval(intervalId);
  }, [includedLinks, agentId]);

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
        status: 'crawling'
      };
      
      const updatedLinks = [newLink, ...includedLinks];
      setIncludedLinks(updatedLinks);
      
      // Store in local storage to persist across page refreshes
      localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(updatedLinks));
      
      toast.success("Website crawl started");
    } catch (error: any) {
      console.error("Error starting crawl:", error);
      toast.error(`Failed to start crawl: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteLink = (index: number) => {
    const newLinks = [...includedLinks];
    newLinks.splice(index, 1);
    setIncludedLinks(newLinks);
    
    // Update local storage
    localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(newLinks));
  };
  
  const handleDeleteAllLinks = () => {
    setIncludedLinks([]);
    
    // Clear local storage
    localStorage.removeItem(`websiteSources-${agentId}`);
    
    toast.success("All links have been removed");
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
    localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(newLinks));
    
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
      localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(updatedLinks));
    } catch (error: any) {
      console.error("Error processing source:", error);
      toast.error(`Failed to process source: ${error.message}`);
      
      // Update state to show processing failed
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
      
      // Update local storage
      localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(updatedLinks));
    }
  };

  // Check crawl status manually
  const handleCheckStatus = async (sourceId: string, index: number) => {
    if (!sourceId) return;
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content")
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
          count: content.pages_crawled || newLinks[index].count
        };
        
        setIncludedLinks(newLinks);
        
        // Update local storage
        localStorage.setItem(`websiteSources-${agentId}`, JSON.stringify(newLinks));
        
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

  return {
    isLoading,
    includedLinks,
    downloadingId,
    handleCrawlWebsite,
    handleDeleteLink,
    handleDeleteAllLinks,
    handleDownloadContent,
    handleProcessSource,
    handleCheckStatus
  };
};

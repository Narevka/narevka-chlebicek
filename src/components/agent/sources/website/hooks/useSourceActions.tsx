
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";

interface UseSourceActionsProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  deletedSourceIds: Set<string>;
  setDeletedSourceIds: (ids: Set<string>) => void;
  localStorageKey: string;
  deletedSourcesKey: string;
  agentId?: string;
}

export const useSourceActions = ({
  includedLinks,
  setIncludedLinks,
  deletedSourceIds,
  setDeletedSourceIds,
  localStorageKey,
  deletedSourcesKey,
  agentId
}: UseSourceActionsProps) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  return {
    downloadingId,
    handleDeleteLink,
    handleDeleteAllLinks,
    handleDownloadContent,
    handleProcessSource
  };
};

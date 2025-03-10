
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";

interface UseDeleteActionsProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  deletedSourceIds: Set<string>;
  setDeletedSourceIds: (ids: Set<string>) => void;
  localStorageKey: string;
  deletedSourcesKey: string;
}

export const useDeleteActions = ({
  includedLinks,
  setIncludedLinks,
  deletedSourceIds,
  setDeletedSourceIds,
  localStorageKey,
  deletedSourcesKey,
}: UseDeleteActionsProps) => {
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

  return {
    handleDeleteLink,
    handleDeleteAllLinks
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";

interface UseCrawledWebsitesProps {
  agentId?: string;
}

export const useCrawledWebsites = ({ agentId }: UseCrawledWebsitesProps) => {
  const [includedLinks, setIncludedLinks] = useState<WebsiteSourceItem[]>([]);
  const [deletedSourceIds, setDeletedSourceIds] = useState<Set<string>>(new Set());
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  
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

  // Clear the deleted sources list (for debugging)
  const clearDeletedSources = () => {
    setDeletedSourceIds(new Set());
    localStorage.removeItem(deletedSourcesKey);
  };

  return {
    includedLinks,
    setIncludedLinks,
    deletedSourceIds,
    setDeletedSourceIds,
    lastCheckTime,
    setLastCheckTime,
    localStorageKey,
    deletedSourcesKey,
    fetchCrawledWebsites,
    clearDeletedSources
  };
};

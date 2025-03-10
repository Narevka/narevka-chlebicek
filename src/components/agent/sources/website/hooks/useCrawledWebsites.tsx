
import { useState, useEffect } from "react";
import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";
import { loadDeletedSourceIds, saveWebsiteSources, clearDeletedSources } from "./utils/localStorageUtils";
import { fetchCrawledWebsites } from "./utils/fetchUtils";

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
    const loadedDeletedIds = loadDeletedSourceIds(deletedSourcesKey);
    setDeletedSourceIds(loadedDeletedIds);
    
    // Fetch from database to get most up-to-date data
    loadWebsiteSources();
  }, [agentId]);

  // Fetch all crawled websites for this agent
  const loadWebsiteSources = async () => {
    if (!agentId) return;
    
    try {
      // First, get our current set of deleted IDs
      const loadedDeletedIds = loadDeletedSourceIds(deletedSourcesKey);
      setDeletedSourceIds(loadedDeletedIds);
      
      // Fetch websites from Supabase
      const websiteSources = await fetchCrawledWebsites(agentId, loadedDeletedIds);
      
      // Update state and localStorage
      setIncludedLinks(websiteSources);
      saveWebsiteSources(localStorageKey, websiteSources);
    } catch (error) {
      console.error("Error loading website sources:", error);
      toast.error("Failed to load website sources");
    }
  };

  // Clear the deleted sources list
  const handleClearDeletedSources = () => {
    setDeletedSourceIds(new Set());
    clearDeletedSources(deletedSourcesKey);
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
    fetchCrawledWebsites: loadWebsiteSources,
    clearDeletedSources: handleClearDeletedSources
  };
};

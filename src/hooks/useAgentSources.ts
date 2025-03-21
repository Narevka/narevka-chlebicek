
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SourceItem, SourceStats } from "@/types/sources";
import { 
  fetchAgentSources, 
  addTextSource, 
  addFileSource, 
  addQASource,
  addWebsiteSource,
  calculateSourceStats 
} from "@/services/sourceDataService";
import { retrainAgent } from "@/services/sourceProcessingService";

// Define interface for crawler options
export interface CrawlOptions {
  limit?: number;
  returnFormat?: string;
  requestType?: string;
  enableProxies?: boolean;
  enableMetadata?: boolean;
  enableAntiBot?: boolean;
  enableFullResources?: boolean;
  enableSubdomains?: boolean;
  enableTlds?: boolean;
}

export const useAgentSources = (agentId: string | undefined) => {
  const { user } = useAuth();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isProcessingSource, setIsProcessingSource] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadSources();
    }
  }, [agentId]);

  const loadSources = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    const sourcesData = await fetchAgentSources(agentId);
    setSources(sourcesData);
    setIsLoading(false);
  };

  const handleAddText = async (text: string) => {
    if (!agentId || !user) return;
    setIsProcessingSource(true);
    
    try {
      await addTextSource(agentId, user.id, text, sources, setSources);
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleAddFiles = async (files: File[]) => {
    if (!agentId || !user) return;
    setIsProcessingSource(true);
    
    try {
      await addFileSource(agentId, user.id, files, sources, setSources);
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleAddQA = async (question: string, answer: string) => {
    if (!agentId || !user) return;
    setIsProcessingSource(true);
    
    try {
      await addQASource(agentId, user.id, question, answer, sources, setSources);
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleAddWebsite = async (url: string, options?: CrawlOptions): Promise<string> => {
    if (!agentId || !user) return "";
    setIsProcessingSource(true);
    
    try {
      const sourceId = await addWebsiteSource(agentId, user.id, url, sources, setSources, options);
      return sourceId;
    } catch (error) {
      console.error("Error in handleAddWebsite:", error);
      throw error;
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleRetrainAgent = async () => {
    if (!agentId) return;
    
    setIsRetraining(true);
    try {
      await retrainAgent(agentId);
    } finally {
      setIsRetraining(false);
    }
  };

  const getSourceStats = (): SourceStats => {
    return calculateSourceStats(sources);
  };

  return {
    sources,
    isLoading,
    isRetraining,
    isProcessingSource,
    handleAddText,
    handleAddFiles,
    handleAddQA,
    handleAddWebsite,
    handleRetrainAgent,
    getSourceStats,
    loadSources // Export this to allow manual refreshing
  };
};


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SourceItem, SourceStats } from "@/types/sources";
import { 
  fetchAgentSources, 
  addTextSource, 
  addFileSource, 
  addQASource,
  calculateSourceStats 
} from "@/services/sourceDataService";
import { retrainAgent } from "@/services/sourceProcessingService";

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
    handleRetrainAgent,
    getSourceStats
  };
};

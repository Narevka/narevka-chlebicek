
import { useState } from "react";
import { CrawlOptions } from "./CrawlOptions";
import { useCrawledWebsites } from "./hooks/useCrawledWebsites";
import { useCrawlStatusChecker } from "./hooks/useCrawlStatusChecker";
import { useSourceActions } from "./hooks/useSourceActions";
import { useCrawlWebsite } from "./hooks/useCrawlWebsite";

interface UseWebsiteCrawlerProps {
  agentId?: string;
  handleAddWebsite: (url: string, options?: CrawlOptions) => Promise<string>;
}

export const useWebsiteCrawler = ({ agentId, handleAddWebsite }: UseWebsiteCrawlerProps) => {
  // Initialize state and fetch initial data with the useCrawledWebsites hook
  const {
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
  } = useCrawledWebsites({ agentId });

  // Periodic and manual status checking with the useCrawlStatusChecker hook
  const {
    handleCheckStatus
  } = useCrawlStatusChecker({ 
    includedLinks, 
    setIncludedLinks, 
    deletedSourceIds, 
    lastCheckTime, 
    setLastCheckTime, 
    localStorageKey 
  });

  // Source actions (delete, download, process) with the useSourceActions hook
  const {
    downloadingId,
    handleDeleteLink,
    handleDeleteAllLinks,
    handleDownloadContent,
    handleProcessSource
  } = useSourceActions({
    includedLinks,
    setIncludedLinks,
    deletedSourceIds,
    setDeletedSourceIds,
    localStorageKey,
    deletedSourcesKey,
    agentId
  });

  // Website crawling functionality with the useCrawlWebsite hook
  const {
    isLoading,
    handleCrawlWebsite
  } = useCrawlWebsite({
    agentId,
    handleAddWebsite,
    includedLinks,
    setIncludedLinks,
    localStorageKey,
    setLastCheckTime
  });

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

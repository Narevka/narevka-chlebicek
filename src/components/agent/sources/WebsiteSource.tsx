
import React from "react";
import { useParams } from "react-router-dom";
import { useAgentSources } from "@/hooks/useAgentSources";
import WebsiteInput from "./website/WebsiteInput";
import WebsiteList from "./website/WebsiteList";
import { useWebsiteCrawler } from "./website/useWebsiteCrawler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWebsiteLogs } from "./website/hooks/useWebsiteLogs";
import WebsiteDebugDialog from "./website/components/WebsiteDebugDialog";
import { WebsiteSourceItem } from "./website/WebsiteItem";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  
  const {
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
  } = useWebsiteCrawler({
    agentId,
    handleAddWebsite
  });

  const {
    formatSourceLogs,
    currentDebugSite,
    setCurrentDebugSite,
    showDebugDialog,
    setShowDebugDialog,
    showWebsiteDebugInfo,
    handleDownloadWebsiteLogs
  } = useWebsiteLogs(includedLinks);

  // Ensure types match properly by fixing the adapter function
  const handleDownloadContentAdapter = (link: WebsiteSourceItem) => {
    if (link.sourceId) {
      handleDownloadContent(link.sourceId, link.url);
    }
  };

  const handleDownloadLogsAdapter = (link: WebsiteSourceItem) => {
    handleDownloadWebsiteLogs(link);
  };

  // Create adapter functions to match expected types for WebsiteList
  const handleCheckStatusAdapter = (sourceId: string, index: number) => {
    handleCheckStatus(sourceId, index);
  };

  const handleProcessSourceAdapter = (sourceId: string, index: number) => {
    handleProcessSource(sourceId, index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Website</h2>
      
      {includedLinks.some(link => link.status === 'crawling') && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Website crawling is in progress. You can navigate away from this page and the process will continue in the background.
            When you return, check the status with the refresh button.
          </AlertDescription>
        </Alert>
      )}
      
      <WebsiteInput 
        onCrawlWebsite={handleCrawlWebsite}
        isLoading={isLoading}
      />

      <WebsiteList 
        includedLinks={includedLinks}
        downloadingId={downloadingId}
        onDeleteLink={handleDeleteLink}
        onDeleteAllLinks={handleDeleteAllLinks}
        onCheckStatus={handleCheckStatusAdapter}
        onProcessSource={handleProcessSourceAdapter}
        onDownloadContent={handleDownloadContentAdapter}
        onShowDebug={showWebsiteDebugInfo}
        onDownloadLogs={handleDownloadLogsAdapter}
      />
      
      <WebsiteDebugDialog
        showDebugDialog={showDebugDialog}
        setShowDebugDialog={setShowDebugDialog}
        currentDebugSite={currentDebugSite}
        formatSourceLogs={formatSourceLogs}
        onDownloadLogs={handleDownloadWebsiteLogs}
      />
    </div>
  );
};

export default WebsiteSource;

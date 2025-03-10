
import React from "react";
import { useParams } from "react-router-dom";
import { useAgentSources } from "@/hooks/useAgentSources";
import WebsiteInput from "./website/WebsiteInput";
import WebsiteList from "./website/WebsiteList";
import { useWebsiteCrawler } from "./website/useWebsiteCrawler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const showDebugInfo = () => {
    console.log("Website sources state:", {
      includedLinks,
      isLoading,
      downloadingId,
      agentId
    });
    
    // Show localStorage data
    const localStorageKey = `websiteSources-${agentId}`;
    const deletedSourcesKey = `deletedSources-${agentId}`;
    
    console.log("LocalStorage data:");
    console.log("- Website sources:", localStorage.getItem(localStorageKey));
    console.log("- Deleted sources:", localStorage.getItem(deletedSourcesKey));
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
        onCheckStatus={handleCheckStatus}
        onProcessSource={handleProcessSource}
        onDownloadContent={handleDownloadContent}
      />
      
      <div className="mt-4 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-gray-600"
          onClick={showDebugInfo}
        >
          <Bug className="h-4 w-4" /> Show Debug Info
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          Click this button to print debugging information to the browser console.
          This can help diagnose issues with website crawling.
        </p>
      </div>
    </div>
  );
};

export default WebsiteSource;

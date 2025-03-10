
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
    // Enhanced debugging: Output more detailed information to the console
    console.log("%c Website Crawler Debug Information", "font-size: 16px; font-weight: bold; color: blue;");
    console.log("%c Current State:", "font-weight: bold");
    console.log("- Agent ID:", agentId);
    console.log("- Loading state:", isLoading);
    console.log("- Downloading ID:", downloadingId);
    
    // More detailed information about included links
    if (includedLinks.length > 0) {
      console.log("- Included Links:", includedLinks);
      console.log("%c First Link Details:", "font-weight: bold");
      const firstLink = includedLinks[0];
      console.log("  - URL:", firstLink.url);
      console.log("  - Status:", firstLink.status);
      console.log("  - Source ID:", firstLink.sourceId);
      console.log("  - Pages count:", firstLink.count);
      console.log("  - Requested limit:", firstLink.requestedLimit || "No limit");
      console.log("  - Chars:", firstLink.chars);
      console.log("  - Notification status:", firstLink.notificationShown ? "Shown" : "Not shown");
      if (firstLink.crawlReport) {
        console.log("  - Crawl report:", firstLink.crawlReport);
      }
    } else {
      console.log("- No links included yet");
    }
    
    // Show localStorage data
    const localStorageKey = `websiteSources-${agentId}`;
    const deletedSourcesKey = `deletedSources-${agentId}`;
    
    console.log("%c localStorage Data:", "font-weight: bold");
    try {
      const websiteSourcesData = localStorage.getItem(localStorageKey);
      const deletedSourcesData = localStorage.getItem(deletedSourcesKey);
      
      console.log("- Website sources from localStorage:", 
        websiteSourcesData ? JSON.parse(websiteSourcesData) : "No data");
      console.log("- Deleted sources from localStorage:", 
        deletedSourcesData ? JSON.parse(deletedSourcesData) : "No data");
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
    }
    
    // Notify user that debug info has been printed
    alert("Debug information has been printed to the browser console. Press F12 or right-click -> Inspect -> Console to view it.");
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

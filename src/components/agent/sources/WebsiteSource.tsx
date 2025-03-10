
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAgentSources } from "@/hooks/useAgentSources";
import WebsiteInput from "./website/WebsiteInput";
import WebsiteList from "./website/WebsiteList";
import { useWebsiteCrawler } from "./website/useWebsiteCrawler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bug, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
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

  // Add a custom console logger to capture logs
  const captureLog = (message: string) => {
    setDebugLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
    console.log(message);
  };

  const showDebugInfo = () => {
    // Enhanced debugging: Output more detailed information to the console
    captureLog("%c Website Crawler Debug Information", "font-size: 16px; font-weight: bold; color: blue;");
    captureLog("%c Current State:", "font-weight: bold");
    captureLog("- Agent ID: " + agentId);
    captureLog("- Loading state: " + isLoading);
    captureLog("- Downloading ID: " + downloadingId);
    
    // More detailed information about included links
    if (includedLinks.length > 0) {
      captureLog("- Included Links: " + JSON.stringify(includedLinks));
      captureLog("%c First Link Details:", "font-weight: bold");
      const firstLink = includedLinks[0];
      captureLog("  - URL: " + firstLink.url);
      captureLog("  - Status: " + firstLink.status);
      captureLog("  - Source ID: " + firstLink.sourceId);
      captureLog("  - Pages count: " + firstLink.count);
      captureLog("  - Requested limit: " + (firstLink.requestedLimit || "No limit"));
      captureLog("  - Chars: " + firstLink.chars);
      captureLog("  - Notification status: " + (firstLink.notificationShown ? "Shown" : "Not shown"));
      captureLog("  - Created at: " + (firstLink.createdAt || "Unknown"));
      if (firstLink.crawlReport) {
        captureLog("  - Crawl report: " + JSON.stringify(firstLink.crawlReport));
      }
    } else {
      captureLog("- No links included yet");
    }
    
    // Show localStorage data
    const localStorageKey = `websiteSources-${agentId}`;
    const deletedSourcesKey = `deletedSources-${agentId}`;
    
    captureLog("%c localStorage Data:", "font-weight: bold");
    try {
      const websiteSourcesData = localStorage.getItem(localStorageKey);
      const deletedSourcesData = localStorage.getItem(deletedSourcesKey);
      
      captureLog("- Website sources from localStorage: " + 
        (websiteSourcesData ? JSON.stringify(JSON.parse(websiteSourcesData)) : "No data"));
      captureLog("- Deleted sources from localStorage: " + 
        (deletedSourcesData ? JSON.stringify(JSON.parse(deletedSourcesData)) : "No data"));
    } catch (error) {
      captureLog("Error parsing localStorage data: " + error);
    }
    
    // Notify user that debug info has been printed
    alert("Debug information has been printed to the browser console and captured for download. Press F12 or right-click -> Inspect -> Console to view it immediately.");
  };

  const handleDownloadDebugLogs = () => {
    // Create a text file with all captured logs
    const logText = debugLogs.join('\n');
    
    // Create file for download
    const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Prepare filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `website-crawler-logs-${timestamp}.txt`;
    
    // Simulate click to download file
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-gray-600"
            onClick={showDebugInfo}
          >
            <Bug className="h-4 w-4" /> Show Debug Info
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-gray-600"
            onClick={handleDownloadDebugLogs}
            disabled={debugLogs.length === 0}
          >
            <Download className="h-4 w-4" /> Download Debug Logs
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click "Show Debug Info" to view debugging information or "Download Debug Logs" to save logs as a text file.
        </p>
      </div>
    </div>
  );
};

export default WebsiteSource;

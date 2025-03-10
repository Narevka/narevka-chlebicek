
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAgentSources } from "@/hooks/useAgentSources";
import WebsiteInput from "./website/WebsiteInput";
import WebsiteList from "./website/WebsiteList";
import { useWebsiteCrawler } from "./website/useWebsiteCrawler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [currentDebugSite, setCurrentDebugSite] = useState<{id: string, url: string} | null>(null);
  
  // Create a map to store logs per source ID
  const [sourceLogsMap, setSourceLogsMap] = useState<Record<string, string[]>>({});
  
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
  const captureLog = (...messages: any[]) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = messages.map(msg => 
      typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
    ).join(' ');
    
    setDebugLogs(prev => [...prev, `[${timestamp}] ${formattedMessage}`]);
    
    // If there's a current website being viewed in debug mode, also add the log to its specific logs
    if (currentDebugSite) {
      setSourceLogsMap(prev => ({
        ...prev,
        [currentDebugSite.id]: [...(prev[currentDebugSite.id] || []), `[${timestamp}] ${formattedMessage}`]
      }));
    }
    
    console.log(...messages);
  };

  // When a website item is updated, capture some basic logs for it
  useEffect(() => {
    includedLinks.forEach(link => {
      if (link.sourceId && !sourceLogsMap[link.sourceId]) {
        // Initialize log array for this source if it doesn't exist
        setSourceLogsMap(prev => ({
          ...prev,
          [link.sourceId!]: [`[${new Date().toISOString()}] Website crawl initiated for ${link.url}`]
        }));
      }
    });
  }, [includedLinks]);

  const showWebsiteDebugInfo = (sourceId: string, url: string) => {
    setCurrentDebugSite({ id: sourceId, url });
    
    // Generate some debug info for this specific website
    const link = includedLinks.find(l => l.sourceId === sourceId);
    if (link) {
      // Create a temp array for these logs
      const tempLogs: string[] = [];
      
      const addLog = (message: string) => {
        const timestamp = new Date().toISOString();
        tempLogs.push(`[${timestamp}] ${message}`);
      };
      
      addLog(`Debug information for ${url} (Source ID: ${sourceId})`);
      addLog(`Status: ${link.status || "Unknown"}`);
      addLog(`Pages crawled: ${link.count}`);
      addLog(`Content size: ${link.chars ? Math.round(link.chars / 1024) + ' KB' : 'Unknown'}`);
      addLog(`Requested limit: ${link.requestedLimit || "Default"}`);
      
      if (link.crawlReport) {
        addLog(`---- Crawl Report ----`);
        addLog(`Pages received: ${link.crawlReport.pagesReceived}`);
        addLog(`Pages with content: ${link.crawlReport.pagesWithContent}`);
        addLog(`Completed at: ${new Date(link.crawlReport.completedAt).toLocaleString()}`);
        addLog(`Total characters: ${link.crawlReport.totalChars}`);
      }
      
      if (link.error) {
        addLog(`---- Error Information ----`);
        addLog(`Error: ${link.error}`);
      }
      
      // Add or merge these logs with any existing logs for this source
      setSourceLogsMap(prev => ({
        ...prev,
        [sourceId]: [...(prev[sourceId] || []), ...tempLogs]
      }));
    }
    
    setShowDebugDialog(true);
  };

  const handleDownloadWebsiteLogs = (sourceId: string, url: string) => {
    // Get logs for this specific website
    const logs = sourceLogsMap[sourceId] || [];
    
    // If no logs, add some basic info
    if (logs.length === 0) {
      const link = includedLinks.find(l => l.sourceId === sourceId);
      logs.push(`[${new Date().toISOString()}] Website crawl record for ${url}`);
      logs.push(`[${new Date().toISOString()}] Status: ${link?.status || "Unknown"}`);
      logs.push(`[${new Date().toISOString()}] Pages crawled: ${link?.count || 0}`);
    }
    
    // Create file for download
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    
    // Prepare filename with timestamp and URL
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    a.download = `website-logs-${sanitizedUrl}-${timestamp}.txt`;
    
    // Simulate click to download file
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
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
        onShowDebug={showWebsiteDebugInfo}
        onDownloadLogs={handleDownloadWebsiteLogs}
      />
      
      {/* Debug Dialog */}
      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Debug Information - {currentDebugSite?.url}</DialogTitle>
            <DialogDescription>
              Details about the website crawl process
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto flex-1 mt-4">
            <div className="bg-gray-100 p-3 rounded font-mono text-sm whitespace-pre-wrap" style={{ maxHeight: '50vh' }}>
              {currentDebugSite && sourceLogsMap[currentDebugSite.id] ? (
                sourceLogsMap[currentDebugSite.id].map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              ) : (
                <p>No logs available for this website.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm mr-2"
              onClick={() => setShowDebugDialog(false)}
            >
              Close
            </button>
            {currentDebugSite && (
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                onClick={() => {
                  if (currentDebugSite) {
                    handleDownloadWebsiteLogs(currentDebugSite.id, currentDebugSite.url);
                  }
                }}
              >
                Download Logs
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsiteSource;

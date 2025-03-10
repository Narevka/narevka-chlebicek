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

interface LogEntry {
  timestamp?: string | number;
  level?: string;
  message?: string;
  details?: any;
}

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [currentDebugSite, setCurrentDebugSite] = useState<{id: string, url: string} | null>(null);
  
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

  const formatSourceLogs = (sourceId: string, url: string): string[] => {
    const link = includedLinks.find(l => l.sourceId === sourceId);
    if (!link) return [];
    
    const formattedLogs: string[] = [
      `--- DEBUG LOGS FOR ${url} ---`,
      `Source ID: ${sourceId}`,
      `Status: ${link.status || "Unknown"}`,
      `Created: ${link.createdAt || "Unknown"}`,
      `Pages: ${link.count || 0}`,
      `Size: ${link.chars ? Math.round(link.chars / 1024) + 'KB' : 'Unknown'}`,
      `Requested limit: ${link.requestedLimit || "Default"}`,
      ''
    ];
    
    if (link.debugLogs && Array.isArray(link.debugLogs)) {
      formattedLogs.push('--- SERVER LOGS ---');
      
      link.debugLogs.forEach((logEntry) => {
        if (logEntry && typeof logEntry === 'object') {
          const log = logEntry as LogEntry;
          const timestamp = log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString();
          const level = log.level || 'info';
          const message = log.message || 'No message';
          
          formattedLogs.push(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
          
          if (log.details) {
            try {
              const detailsStr = JSON.stringify(log.details, null, 2);
              formattedLogs.push('  Details:');
              detailsStr.split('\n').forEach(line => {
                formattedLogs.push(`    ${line}`);
              });
            } catch (e) {
              formattedLogs.push(`  Details: ${JSON.stringify(log.details)}`);
            }
          }
        } else if (typeof logEntry === 'string') {
          formattedLogs.push(logEntry);
        }
      });
      
      formattedLogs.push('');
    }
    
    if (sourceLogsMap[sourceId] && sourceLogsMap[sourceId].length > 0) {
      formattedLogs.push('--- FRONTEND LOGS ---');
      formattedLogs.push(...sourceLogsMap[sourceId]);
    }
    
    if (link.crawlReport) {
      formattedLogs.push('');
      formattedLogs.push('--- CRAWL REPORT ---');
      try {
        const reportStr = JSON.stringify(link.crawlReport, null, 2);
        reportStr.split('\n').forEach(line => {
          formattedLogs.push(line);
        });
      } catch (e) {
        formattedLogs.push(JSON.stringify(link.crawlReport));
      }
    }
    
    return formattedLogs;
  };

  useEffect(() => {
    includedLinks.forEach(link => {
      if (link.sourceId && !sourceLogsMap[link.sourceId]) {
        setSourceLogsMap(prev => ({
          ...prev,
          [link.sourceId!]: [`[${new Date().toISOString()}] Website crawl initiated for ${link.url}`]
        }));
      }
    });
  }, [includedLinks]);

  const showWebsiteDebugInfo = (sourceId: string, url: string) => {
    setCurrentDebugSite({ id: sourceId, url });
    
    const linkIndex = includedLinks.findIndex(l => l.sourceId === sourceId);
    if (linkIndex >= 0) {
      handleCheckStatus(sourceId, linkIndex);
    }
    
    setShowDebugDialog(true);
  };

  const handleDownloadWebsiteLogs = (sourceId: string, url: string) => {
    const logs = formatSourceLogs(sourceId, url);
    
    if (logs.length === 0) {
      const link = includedLinks.find(l => l.sourceId === sourceId);
      logs.push(`No logs available for ${url} (Source ID: ${sourceId})`);
      logs.push(`Status: ${link?.status || "Unknown"}`);
      logs.push(`Pages crawled: ${link?.count || 0}`);
    }
    
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    a.download = `crawl-logs-${sanitizedUrl}-${timestamp}.txt`;
    
    document.body.appendChild(a);
    a.click();
    
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
              {currentDebugSite && (
                formatSourceLogs(currentDebugSite.id, currentDebugSite.url).map((log, i) => (
                  <div key={i} className={
                    log.includes('[ERROR]') 
                      ? 'text-red-600 mb-1' 
                      : log.includes('[WARNING]') 
                        ? 'text-amber-600 mb-1' 
                        : 'mb-1'
                  }>
                    {log}
                  </div>
                ))
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

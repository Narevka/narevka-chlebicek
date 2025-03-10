
import { useState, useEffect } from "react";
import { WebsiteSourceItem } from "../WebsiteItem";

interface LogEntry {
  timestamp?: string | number;
  level?: string;
  message?: string;
  details?: any;
}

export const useWebsiteLogs = (includedLinks: WebsiteSourceItem[]) => {
  const [sourceLogsMap, setSourceLogsMap] = useState<Record<string, string[]>>({});
  const [currentDebugSite, setCurrentDebugSite] = useState<{id: string, url: string} | null>(null);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  
  useEffect(() => {
    includedLinks.forEach(link => {
      if (link.sourceId && !sourceLogsMap[link.sourceId]) {
        setSourceLogsMap(prev => ({
          ...prev,
          [link.sourceId!]: [`[${new Date().toISOString()}] Website crawl initiated for ${link.url}`]
        }));
      }
    });
  }, [includedLinks, sourceLogsMap]);

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

  const showWebsiteDebugInfo = (sourceId: string, url: string) => {
    setCurrentDebugSite({ id: sourceId, url });
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

  return {
    sourceLogsMap,
    formatSourceLogs,
    currentDebugSite,
    setCurrentDebugSite,
    showDebugDialog,
    setShowDebugDialog,
    showWebsiteDebugInfo,
    handleDownloadWebsiteLogs
  };
};

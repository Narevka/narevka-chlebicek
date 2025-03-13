
import { useState } from "react";
import { WebsiteSourceItem } from "../WebsiteItem";

// Function to format logs for display
const formatLogs = (logs: any[] = []) => {
  return logs.map(log => {
    const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : '';
    const level = log.level ? `[${log.level.toUpperCase()}]` : '';
    const message = log.message || '';
    
    return `${timestamp} ${level} ${message}`;
  });
};

export const useWebsiteLogs = (includedLinks: WebsiteSourceItem[]) => {
  const [currentDebugSite, setCurrentDebugSite] = useState<{id: string, url: string} | null>(null);
  const [showDebugDialog, setShowDebugDialog] = useState(false);

  const formatSourceLogs = (sourceId: string, url: string) => {
    const source = includedLinks.find(link => link.sourceId === sourceId);
    if (!source || !source.debugLogs) return [];
    
    return formatLogs(source.debugLogs);
  };

  const showWebsiteDebugInfo = (link: WebsiteSourceItem) => {
    if (!link.sourceId) return;
    
    setCurrentDebugSite({id: link.sourceId, url: link.url});
    setShowDebugDialog(true);
  };

  const handleDownloadWebsiteLogs = (link: WebsiteSourceItem) => {
    if (!link.sourceId || !link.debugLogs) return;
    
    const logs = formatLogs(link.debugLogs).join('\n');
    
    // Create a blob with the log content
    const blob = new Blob([logs], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${link.url.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    
    // Trigger the download
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    formatSourceLogs,
    currentDebugSite,
    setCurrentDebugSite,
    showDebugDialog,
    setShowDebugDialog,
    showWebsiteDebugInfo,
    handleDownloadWebsiteLogs
  };
};

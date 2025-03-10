
import React from "react";
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

interface WebsiteDebugDialogProps {
  showDebugDialog: boolean;
  setShowDebugDialog: (show: boolean) => void;
  currentDebugSite: {id: string, url: string} | null;
  formatSourceLogs: (sourceId: string, url: string) => string[];
  onDownloadLogs: (sourceId: string, url: string) => void;
}

const WebsiteDebugDialog: React.FC<WebsiteDebugDialogProps> = ({
  showDebugDialog,
  setShowDebugDialog,
  currentDebugSite,
  formatSourceLogs,
  onDownloadLogs
}) => {
  return (
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
                  onDownloadLogs(currentDebugSite.id, currentDebugSite.url);
                }
              }}
            >
              Download Logs
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteDebugDialog;


import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Download, 
  RotateCw, 
  RefreshCw, 
  Info, 
  Bug, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WebsiteItemActionsProps {
  sourceId: string | undefined;
  url: string;
  status?: string;
  index: number;
  downloadingId: string | null;
  isProcessing?: boolean;
  showDetails: boolean;
  onDelete: (index: number) => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcess: (sourceId: string, index: number) => void;
  onDownload: (sourceId: string, url: string) => void;
  onShowDebug?: (sourceId: string, url: string) => void;
  onDownloadLogs?: (sourceId: string, url: string) => void;
  onToggleDetails: () => void;
  crawlReport?: any;
  chars?: number;
}

const formatSize = (chars?: number): string => {
  if (!chars) return "0 KB";
  
  const kb = Math.round(chars / 1024);
  if (kb < 1024) return `${kb} KB`;
  
  const mb = (kb / 1024).toFixed(1);
  return `${mb} MB`;
};

const WebsiteItemActions: React.FC<WebsiteItemActionsProps> = ({
  sourceId,
  url,
  status,
  index,
  downloadingId,
  isProcessing,
  showDetails,
  onDelete,
  onCheckStatus,
  onProcess,
  onDownload,
  onShowDebug,
  onDownloadLogs,
  onToggleDetails,
  crawlReport,
  chars
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-blue-500 p-1 h-auto"
        onClick={() => sourceId && onCheckStatus(sourceId, index)}
        disabled={!sourceId}
        title="Check status"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      
      {sourceId && status === 'completed' && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 p-1 h-auto"
                title="View crawl details"
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-1">
                <h4 className="font-medium">Crawl Details</h4>
                <div className="text-sm">
                  <p><span className="font-medium">URL:</span> {url}</p>
                  {crawlReport && (
                    <>
                      <p><span className="font-medium">Pages Received:</span> {crawlReport.pagesReceived || "N/A"}</p>
                      <p><span className="font-medium">Completed At:</span> {new Date(crawlReport.completedAt).toLocaleString()}</p>
                    </>
                  )}
                  <p><span className="font-medium">Size:</span> {formatSize(chars)}</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500 p-1 h-auto"
            onClick={() => sourceId && onProcess(sourceId, index)}
            disabled={isProcessing}
            title="Process with OpenAI"
          >
            <RotateCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500 p-1 h-auto"
            onClick={() => sourceId && onDownload(sourceId, url)}
            disabled={downloadingId === sourceId}
            title="Download content"
          >
            <Download className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {onShowDebug && sourceId && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 p-1 h-auto"
          onClick={() => onShowDebug(sourceId, url)}
          title="Show Debug Info"
        >
          <Bug className="h-4 w-4" />
        </Button>
      )}
      
      {onDownloadLogs && sourceId && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 p-1 h-auto"
          onClick={() => onDownloadLogs(sourceId, url)}
          title="Download Debug Logs"
        >
          <Download className="h-4 w-4 text-gray-600" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-500 p-1 h-auto"
        onClick={() => onDelete(index)}
        title="Delete website"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-gray-500"
        onClick={onToggleDetails}
      >
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default WebsiteItemActions;

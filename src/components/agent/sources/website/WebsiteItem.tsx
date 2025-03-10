import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, RotateCw, RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface WebsiteSourceItem {
  url: string;
  count: number;
  sourceId?: string;
  isProcessing?: boolean;
  status?: 'crawling' | 'completed' | 'error';
  error?: string;
  chars?: number;
  requestedLimit?: number;
  crawlOptions?: any;
  crawlReport?: any;
  notificationShown?: boolean; // Add this flag to track notification state
}

interface WebsiteItemProps {
  link: WebsiteSourceItem;
  index: number;
  downloadingId: string | null;
  onDelete: (index: number) => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcess: (sourceId: string, index: number) => void;
  onDownload: (sourceId: string, url: string) => void;
}

const WebsiteItem: React.FC<WebsiteItemProps> = ({
  link,
  index,
  downloadingId,
  onDelete,
  onCheckStatus,
  onProcess,
  onDownload
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Function to get badge for current status
  const getStatusBadge = (status?: string) => {
    if (!status || status === 'crawling') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Crawling</Badge>;
    } else if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (status === 'error') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
    }
    return null;
  };

  // Format file size
  const formatSize = (chars?: number): string => {
    if (!chars) return "0 KB";
    
    const kb = Math.round(chars / 1024);
    if (kb < 1024) return `${kb} KB`;
    
    const mb = (kb / 1024).toFixed(1);
    return `${mb} MB`;
  };

  return (
    <div className="border rounded-md p-2 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge(link.status)}
          <span className="truncate max-w-xs md:max-w-sm">{link.url}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{link.count} pages</span>
          {link.requestedLimit && (
            <span className="text-gray-500 text-sm">
              (limit: {link.requestedLimit})
            </span>
          )}
          {link.chars !== undefined && link.chars > 0 && (
            <span className="text-gray-500 text-sm">{formatSize(link.chars)}</span>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500 p-1 h-auto"
            onClick={() => onCheckStatus(link.sourceId!, index)}
            disabled={!link.sourceId}
            title="Check status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {link.sourceId && link.status === 'completed' && (
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
                      <p><span className="font-medium">URL:</span> {link.url}</p>
                      <p><span className="font-medium">Pages:</span> {link.count}</p>
                      <p><span className="font-medium">Requested Limit:</span> {link.requestedLimit || "Not specified"}</p>
                      <p><span className="font-medium">Size:</span> {formatSize(link.chars)}</p>
                      {link.crawlReport && (
                        <>
                          <p><span className="font-medium">Pages Received:</span> {link.crawlReport.pagesReceived || "N/A"}</p>
                          <p><span className="font-medium">Completed At:</span> {new Date(link.crawlReport.completedAt).toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 p-1 h-auto"
                onClick={() => onProcess(link.sourceId!, index)}
                disabled={link.isProcessing}
                title="Process with OpenAI"
              >
                <RotateCw className={`h-4 w-4 ${link.isProcessing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 p-1 h-auto"
                onClick={() => onDownload(link.sourceId!, link.url)}
                disabled={downloadingId === link.sourceId}
                title="Download content"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
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
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-2 text-sm text-gray-600 border-t pt-2 pl-2">
          {link.error && (
            <div className="text-red-500 mb-2">
              <strong>Error:</strong> {link.error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p><strong>Status:</strong> {link.status || "Unknown"}</p>
              <p><strong>Source ID:</strong> {link.sourceId || "N/A"}</p>
              <p><strong>Requested Limit:</strong> {link.requestedLimit || "Default"}</p>
            </div>
            <div>
              <p><strong>Pages Crawled:</strong> {link.count}</p>
              <p><strong>Content Size:</strong> {formatSize(link.chars)}</p>
              {link.crawlOptions && (
                <p><strong>Request Type:</strong> {link.crawlOptions.requestType || "Default"}</p>
              )}
            </div>
          </div>
          
          {link.crawlReport && (
            <div className="mt-2 border-t pt-2">
              <p className="font-medium">Detailed Crawl Report</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <p><strong>Pages Received:</strong> {link.crawlReport.pagesReceived}</p>
                <p><strong>Pages With Content:</strong> {link.crawlReport.pagesWithContent}</p>
                <p><strong>Completed At:</strong> {new Date(link.crawlReport.completedAt).toLocaleString()}</p>
                <p><strong>Total Characters:</strong> {link.crawlReport.totalChars}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteItem;

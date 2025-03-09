
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, RotateCw, RefreshCw } from "lucide-react";

export interface WebsiteSourceItem {
  url: string;
  count: number;
  sourceId?: string;
  isProcessing?: boolean;
  status?: 'crawling' | 'completed' | 'error';
  error?: string;
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

  return (
    <div className="flex items-center justify-between border rounded-md p-2">
      <div className="flex items-center gap-2">
        {getStatusBadge(link.status)}
        <span className="truncate max-w-md">{link.url}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{link.count} pages</span>
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
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WebsiteItem;

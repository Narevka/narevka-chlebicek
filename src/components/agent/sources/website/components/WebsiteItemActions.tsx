import React from "react";
import { Calendar, RefreshCw, Download, Trash2, MoreVertical, AlertCircle, Eye, FileText, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WebsiteSourceItem } from "../WebsiteItem";

interface WebsiteItemActionsProps {
  link: WebsiteSourceItem;
  index: number;
  isDownloading?: boolean;
  onDelete: (index: number) => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcessSource: (sourceId: string, index: number) => void;
  onDownloadContent: (link: WebsiteSourceItem) => void;
  onShowDebug: (link: WebsiteSourceItem) => void;
  onDownloadLogs: (link: WebsiteSourceItem) => void;
}

const WebsiteItemActions: React.FC<WebsiteItemActionsProps> = ({
  link,
  index,
  isDownloading,
  onDelete,
  onCheckStatus,
  onProcessSource,
  onDownloadContent,
  onShowDebug,
  onDownloadLogs
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleCheckStatus = () => {
    if (link.sourceId) {
      onCheckStatus(link.sourceId, index);
    }
  };

  const handleProcessSource = () => {
    if (link.sourceId) {
      onProcessSource(link.sourceId, index);
    }
  };

  const handleDownloadContent = () => {
    onDownloadContent(link);
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleShowDebug = () => {
    onShowDebug(link);
  };

  const handleDownloadLogs = () => {
    onDownloadLogs(link);
  };

  return (
    <div className="flex justify-between items-center mt-2 pt-2 border-t">
      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="h-3 w-3 mr-1" />
        {link.timestamp ? formatDate(link.timestamp) : "Just now"}
      </div>
      
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCheckStatus}
                disabled={!link.sourceId || link.isProcessing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Check status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {link.status === 'completed' && link.sourceId && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadContent}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {link.isProcessing ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      disabled={true}
                    >
                      <Upload className="h-4 w-4 animate-pulse" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Processing...</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : link.isProcessed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={true}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Processed and added to agent</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleProcessSource}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Process and add to agent</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
        
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent>
            {link.status === 'error' && (
              <DropdownMenuItem onClick={handleShowDebug} disabled={!link.error}>
                <AlertCircle className="h-4 w-4 mr-2" />
                View error
              </DropdownMenuItem>
            )}
            
            {link.debugLogs && link.debugLogs.length > 0 && (
              <>
                <DropdownMenuItem onClick={handleShowDebug}>
                  <Eye className="h-4 w-4 mr-2" />
                  View logs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadLogs}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download logs
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default WebsiteItemActions;

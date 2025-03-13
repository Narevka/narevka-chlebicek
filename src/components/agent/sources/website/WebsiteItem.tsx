
import React from "react";
import { Calendar, RefreshCw, Download, Trash2, MoreVertical, AlertCircle, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatusBadge from "./components/StatusBadge";
import WebsiteItemDetails from "./components/WebsiteItemDetails";
import WebsiteItemActions from "./components/WebsiteItemActions";

export interface WebsiteSourceItem {
  sourceId?: string;
  url: string;
  status: 'error' | 'crawling' | 'completed';
  count: number;
  chars: number;
  error?: string;
  crawlReport?: any;
  debugLogs?: any[];
  requestedLimit?: number;
  timestamp?: string;
  notificationShown?: boolean;
  isProcessing?: boolean;
  isProcessed?: boolean;
}

interface WebsiteItemProps {
  link: WebsiteSourceItem;
  index: number;
  isDownloading?: boolean;
  onDelete: (index: number) => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcessSource: (sourceId: string, index: number) => void;
  onDownloadContent: (sourceId: string, url: string) => void;
  onShowDebug: (link: WebsiteSourceItem) => void;
  onDownloadLogs: (link: WebsiteSourceItem) => void;
}

const WebsiteItem: React.FC<WebsiteItemProps> = ({
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
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg mb-4">
      {/* Details section */}
      <WebsiteItemDetails link={link} />
      
      {/* Actions section */}
      <WebsiteItemActions 
        link={link}
        index={index}
        isDownloading={isDownloading}
        onDelete={onDelete}
        onCheckStatus={onCheckStatus}
        onProcessSource={onProcessSource}
        onDownloadContent={onDownloadContent}
        onShowDebug={onShowDebug}
        onDownloadLogs={onDownloadLogs}
      />
    </div>
  );
};

export default WebsiteItem;

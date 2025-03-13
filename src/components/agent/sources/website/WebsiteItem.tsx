
import React from "react";
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
  createdAt?: string;
  crawlOptions?: any;
}

interface WebsiteItemProps {
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
      <WebsiteItemDetails 
        sourceId={link.sourceId}
        status={link.status}
        requestedLimit={link.requestedLimit}
        count={link.count}
        chars={link.chars}
        error={link.error}
        crawlOptions={link.crawlOptions}
        crawlReport={link.crawlReport}
      />
      
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


import React, { useState } from "react";
import StatusBadge from "./components/StatusBadge";
import WebsiteItemActions from "./components/WebsiteItemActions";
import WebsiteItemDetails from "./components/WebsiteItemDetails";

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
  notificationShown?: boolean;
  createdAt?: string;
  debugLogs?: string[];
}

interface WebsiteItemProps {
  link: WebsiteSourceItem;
  index: number;
  downloadingId: string | null;
  onDelete: (index: number) => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcess: (sourceId: string, index: number) => void;
  onDownload: (sourceId: string, url: string) => void;
  onShowDebug?: (sourceId: string, url: string) => void;
  onDownloadLogs?: (sourceId: string, url: string) => void;
}

const WebsiteItem: React.FC<WebsiteItemProps> = ({
  link,
  index,
  downloadingId,
  onDelete,
  onCheckStatus,
  onProcess,
  onDownload,
  onShowDebug,
  onDownloadLogs
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => setShowDetails(!showDetails);

  return (
    <div className="border rounded-md p-2 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={link.status} />
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
            <span className="text-gray-500 text-sm">
              {Math.round(link.chars / 1024)} KB
            </span>
          )}
          
          <WebsiteItemActions 
            sourceId={link.sourceId}
            url={link.url}
            status={link.status}
            index={index}
            downloadingId={downloadingId}
            isProcessing={link.isProcessing}
            showDetails={showDetails}
            onDelete={onDelete}
            onCheckStatus={onCheckStatus}
            onProcess={onProcess}
            onDownload={onDownload}
            onShowDebug={onShowDebug}
            onDownloadLogs={onDownloadLogs}
            onToggleDetails={handleToggleDetails}
            crawlReport={link.crawlReport}
            chars={link.chars}
          />
        </div>
      </div>
      
      {showDetails && (
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
      )}
    </div>
  );
};

export default WebsiteItem;

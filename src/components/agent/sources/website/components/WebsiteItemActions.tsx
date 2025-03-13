
import React from "react";
import { WebsiteSourceItem } from "../WebsiteItem";
import DateDisplay from "./actions/DateDisplay";
import ActionButtons from "./actions/ActionButtons";

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
  return (
    <div className="flex justify-between items-center mt-2 pt-2 border-t">
      <DateDisplay timestamp={link.timestamp} />
      
      <ActionButtons
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

export default WebsiteItemActions;

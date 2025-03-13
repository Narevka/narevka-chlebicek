
import React from "react";
import { WebsiteSourceItem } from "../../WebsiteItem";
import StatusButton from "./StatusButton";
import DownloadButton from "./DownloadButton";
import ProcessButton from "./ProcessButton";
import MoreOptionsMenu from "./MoreOptionsMenu";

interface ActionButtonsProps {
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

const ActionButtons: React.FC<ActionButtonsProps> = ({
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
    <div className="flex gap-2">
      <StatusButton 
        sourceId={link.sourceId}
        isProcessing={link.isProcessing}
        onCheckStatus={handleCheckStatus}
      />
      
      {link.status === 'completed' && link.sourceId && (
        <>
          <DownloadButton
            onDownload={handleDownloadContent}
            isDownloading={isDownloading}
          />
          
          <ProcessButton
            isProcessing={link.isProcessing}
            isProcessed={link.isProcessed}
            onProcess={handleProcessSource}
          />
        </>
      )}
      
      <MoreOptionsMenu
        link={link}
        onDelete={handleDelete}
        onShowDebug={handleShowDebug}
        onDownloadLogs={handleDownloadLogs}
      />
    </div>
  );
};

export default ActionButtons;

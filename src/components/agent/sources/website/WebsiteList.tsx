
import React from "react";
import { Button } from "@/components/ui/button";
import WebsiteItem, { WebsiteSourceItem } from "./WebsiteItem";

interface WebsiteListProps {
  includedLinks: WebsiteSourceItem[];
  downloadingId: string | null;
  onDeleteLink: (index: number) => void;
  onDeleteAllLinks: () => void;
  onCheckStatus: (sourceId: string, index: number) => void;
  onProcessSource: (sourceId: string, index: number) => void;
  onDownloadContent: (sourceId: string, url: string) => void;
}

const WebsiteList: React.FC<WebsiteListProps> = ({
  includedLinks,
  downloadingId,
  onDeleteLink,
  onDeleteAllLinks,
  onCheckStatus,
  onProcessSource,
  onDownloadContent
}) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Added websites</h3>
        <Button 
          variant="ghost" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
          onClick={onDeleteAllLinks}
          disabled={includedLinks.length === 0}
        >
          Remove all
        </Button>
      </div>

      <div className="space-y-2">
        {includedLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No websites added yet</p>
        ) : (
          includedLinks.map((link, index) => (
            <WebsiteItem
              key={index}
              link={link}
              index={index}
              downloadingId={downloadingId}
              onDelete={onDeleteLink}
              onCheckStatus={onCheckStatus}
              onProcess={onProcessSource}
              onDownload={onDownloadContent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WebsiteList;


import React from "react";

interface WebsiteItemDetailsProps {
  sourceId?: string;
  status?: string; 
  requestedLimit?: number;
  count: number;
  chars?: number;
  error?: string;
  crawlOptions?: any;
  crawlReport?: any;
}

const formatSize = (chars?: number): string => {
  if (!chars) return "0 KB";
  
  const kb = Math.round(chars / 1024);
  if (kb < 1024) return `${kb} KB`;
  
  const mb = (kb / 1024).toFixed(1);
  return `${mb} MB`;
};

const WebsiteItemDetails: React.FC<WebsiteItemDetailsProps> = ({
  sourceId,
  status,
  requestedLimit,
  count,
  chars,
  error,
  crawlOptions,
  crawlReport
}) => {
  return (
    <div className="mt-2 text-sm text-gray-600 border-t pt-2 pl-2">
      {error && (
        <div className="text-red-500 mb-2">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <p><strong>Status:</strong> {status || "Unknown"}</p>
          <p><strong>Source ID:</strong> {sourceId || "N/A"}</p>
          <p><strong>Requested Limit:</strong> {requestedLimit || "Default"}</p>
        </div>
        <div>
          <p><strong>Pages Crawled:</strong> {count}</p>
          <p><strong>Content Size:</strong> {formatSize(chars)}</p>
          {crawlOptions && (
            <p><strong>Request Type:</strong> {crawlOptions.requestType || "Default"}</p>
          )}
        </div>
      </div>
      
      {crawlReport && (
        <div className="mt-2 border-t pt-2">
          <p className="font-medium">Detailed Crawl Report</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <p><strong>Pages Received:</strong> {crawlReport.pagesReceived}</p>
            <p><strong>Pages With Content:</strong> {crawlReport.pagesWithContent}</p>
            <p><strong>Completed At:</strong> {new Date(crawlReport.completedAt).toLocaleString()}</p>
            <p><strong>Total Characters:</strong> {crawlReport.totalChars}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteItemDetails;

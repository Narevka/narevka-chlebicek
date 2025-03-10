
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
  // Calculate average page size if we have both chars and count
  const avgPageSize = chars && count > 0 ? Math.round(chars / count / 1024) : null;
  
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
          <p><strong>Avg Page Size:</strong> {avgPageSize ? `${avgPageSize} KB` : "Unknown"}</p>
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
            <p><strong>Total Characters:</strong> {new Intl.NumberFormat().format(crawlReport.totalChars)}</p>
            {crawlReport.originalLength && crawlReport.storedLength && (
              <p>
                <strong>Content Truncation:</strong> 
                {crawlReport.originalLength > crawlReport.storedLength ? 
                  `${Math.round((1 - crawlReport.storedLength / crawlReport.originalLength) * 100)}% truncated` : 
                  "None"}
              </p>
            )}
            {crawlReport.processingStats && (
              <>
                <p><strong>Avg Chars/Page:</strong> {new Intl.NumberFormat().format(crawlReport.processingStats.avgCharsPerPage)}</p>
                <p><strong>Largest Page:</strong> {formatSize(crawlReport.processingStats.largestPage)}</p>
                <p><strong>Smallest Page:</strong> {formatSize(crawlReport.processingStats.smallestPage)}</p>
              </>
            )}
          </div>
          
          {crawlReport.pageSizes && crawlReport.pageSizes.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Page Size Distribution (Sample)</p>
              <div className="text-xs mt-1 max-h-40 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-1 text-left">URL</th>
                      <th className="p-1 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crawlReport.pageSizes.map((page: any, i: number) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="p-1 truncate max-w-[240px]">{page.url}</td>
                        <td className="p-1 text-right">{page.size_kb || Math.round(page.chars / 1024)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteItemDetails;

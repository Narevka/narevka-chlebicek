
import { WebsiteSourceItem } from "../../WebsiteItem";
import { fetchSourceWithRetry } from "./fetchUtils";
import { toast } from "sonner";

/**
 * Process source content after fetching
 */
export const processSourceContent = (
  sourceContent: any,
  link: WebsiteSourceItem
): {
  status?: "error" | "crawling" | "completed";
  error?: string;
  count?: number;
  chars?: number;
  crawlReport?: any;
  debugLogs?: any[];
  hasChanges: boolean;
  notificationShown?: boolean;
} => {
  let content;
  try {
    content = JSON.parse(sourceContent);
  } catch (e) {
    console.error("Error parsing content:", e);
    return { hasChanges: false };
  }

  // Check if status changed
  if (content.status && content.status !== link.status) {
    // Log the full content for debugging
    console.log(`Status change for source ${link.sourceId} (${link.url}):`, content);
    
    // Extract and save crawl report if available
    const crawlReport = content.crawl_report || null;
    
    // Extract logs if they exist
    const sourceLogs = content.logs || [];
    
    // Ensure status is one of the allowed values
    const status = content.status === "error" || content.status === "crawling" || content.status === "completed" 
      ? content.status 
      : "error";
    
    return {
      status,
      error: content.error,
      count: content.pages_crawled || link.count,
      crawlReport: crawlReport,
      debugLogs: sourceLogs,
      hasChanges: true
    };
  } else if (content.logs && Array.isArray(content.logs)) {
    // Even if status didn't change, we want to capture any new logs
    return {
      debugLogs: content.logs,
      hasChanges: true
    };
  }
  
  return { hasChanges: false };
};

/**
 * Show appropriate notifications based on crawl status
 */
export const showStatusNotifications = (
  status: string,
  url: string,
  error?: string,
  pagesInfo?: string,
  notificationShown?: boolean
): boolean => {
  // Only show notification if it hasn't been shown yet and status is completed or error
  if (status === 'completed' && !notificationShown) {
    toast.success(`Crawl completed for ${url}${pagesInfo || ''}`);
    console.log(`Crawl completed for ${url}${pagesInfo || ''}`);
    return true;
  } else if (status === 'error' && !notificationShown) {
    toast.error(`Crawl failed for ${url}: ${error}`);
    console.error(`Crawl failed for ${url}: ${error}`);
    return true;
  }
  
  return false;
};

/**
 * Check status for a specific source
 */
export const checkSourceStatus = async (
  sourceId: string,
  link: WebsiteSourceItem
): Promise<{
  updatedLink?: WebsiteSourceItem;
  hasChanges: boolean;
  message?: "error" | "crawling" | "completed";
}> => {
  try {
    console.log(`Checking status for source ${sourceId}`);
    
    // Use retry mechanism
    const { data, error } = await fetchSourceWithRetry(sourceId);

    if (error) {
      return { 
        hasChanges: false,
        message: "error" as const
      };
    }
    
    if (!data || !data.content) {
      return { hasChanges: false };
    }
    
    // Process the content
    const processingResult = processSourceContent(data.content, link);
    
    if (!processingResult.hasChanges) {
      return { hasChanges: false };
    }
    
    // Prepare detailed message
    let detailMsg = '';
    if (processingResult.crawlReport) {
      detailMsg = ` - ${processingResult.crawlReport.pagesReceived || 0} pages received`;
      if (link.requestedLimit) {
        detailMsg += ` (requested: ${link.requestedLimit})`;
      }
    }
    
    // Show notifications
    const notificationShown = showStatusNotifications(
      processingResult.status || link.status,
      link.url,
      processingResult.error,
      detailMsg,
      link.notificationShown
    );
    
    // Update the link with current status
    const updatedLink: WebsiteSourceItem = {
      ...link,
      status: processingResult.status || link.status,
      error: processingResult.error,
      count: processingResult.count || link.count,
      chars: data.chars || link.chars,
      crawlReport: processingResult.crawlReport || link.crawlReport,
      debugLogs: processingResult.debugLogs || link.debugLogs,
      notificationShown: notificationShown || link.notificationShown
    };
    
    return {
      updatedLink,
      hasChanges: true,
      message: processingResult.status
    };
  } catch (error: any) {
    console.error("Error checking status:", error);
    return { 
      hasChanges: false,
      message: "error" as const
    };
  }
};

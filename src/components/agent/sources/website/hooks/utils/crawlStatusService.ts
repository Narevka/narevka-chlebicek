
import { WebsiteSourceItem } from "../../WebsiteItem";
import { toast } from "sonner";

type StatusResponse = {
  source_id: string;
  status: 'error' | 'crawling' | 'completed';
  url: string;
  count: number;
  chars: number;
  error?: string;
  crawl_report?: any;
  debug_logs?: any[];
  timestamp?: string;
};

export const processCrawlStatus = (
  sourceId: string,
  statusData: StatusResponse | null,
  includedLinks: WebsiteSourceItem[],
  deletedSourceIds: Set<string>,
  index: number
): { 
  updatedLinks: WebsiteSourceItem[], 
  shouldShowNotification: boolean,
  notificationType: 'error' | 'crawling' | 'completed' | null,
  notificationMessage: string,
} => {
  // Initialize return values
  let updatedLinks = [...includedLinks];
  let shouldShowNotification = false;
  let notificationType: 'error' | 'crawling' | 'completed' | null = null;
  let notificationMessage = '';

  // If this is a deleted source, don't process it
  if (deletedSourceIds.has(sourceId)) {
    console.log(`Source ${sourceId} has been deleted, skipping status update`);
    return { 
      updatedLinks, 
      shouldShowNotification, 
      notificationType, 
      notificationMessage
    };
  }

  // If we don't have the source in our list anymore, don't process it
  if (index === -1) {
    console.log(`Source ${sourceId} not found in includedLinks, skipping status update`);
    return { 
      updatedLinks, 
      shouldShowNotification, 
      notificationType, 
      notificationMessage
    };
  }

  // If we don't have a status response (e.g. network error), don't update
  if (!statusData) {
    return { 
      updatedLinks, 
      shouldShowNotification, 
      notificationType, 
      notificationMessage 
    };
  }

  // Get current link data
  const currentLink = includedLinks[index];
  const oldStatus = currentLink.status;
  
  console.log(`Processing status update for ${statusData.url}: ${statusData.status}, old status: ${oldStatus}`);

  // Create updated link object
  const updatedLink: WebsiteSourceItem = {
    ...currentLink,
    status: statusData.status,
    count: statusData.count,
    chars: statusData.chars,
    error: statusData.error,
    crawlReport: statusData.crawl_report,
    debugLogs: statusData.debug_logs,
    timestamp: statusData.timestamp || currentLink.timestamp
  };

  // Check for status changes that need notifications
  if (oldStatus !== statusData.status) {
    console.log(`Status changed from ${oldStatus} to ${statusData.status}`);
    
    // If the site completed crawling and we haven't shown a notification yet
    if (statusData.status === 'completed' && !currentLink.notificationShown) {
      shouldShowNotification = true;
      notificationType = 'completed';
      notificationMessage = `${statusData.url} crawl completed: ${statusData.count} pages, ${Math.round(statusData.chars / 1024)} KB`;
      
      // Mark notification as shown
      updatedLink.notificationShown = true;
    }
    
    // If the site encountered an error and we haven't shown an error notification
    if (statusData.status === 'error' && !currentLink.notificationShown) {
      shouldShowNotification = true;
      notificationType = 'error';
      notificationMessage = `Error crawling ${statusData.url}: ${statusData.error || 'Unknown error'}`;
      
      // Mark notification as shown
      updatedLink.notificationShown = true;
    }
  }
  
  // Update the link in our array
  updatedLinks[index] = updatedLink;
  
  return {
    updatedLinks,
    shouldShowNotification,
    notificationType,
    notificationMessage
  };
};

export const showCrawlStatusNotification = (
  notificationType: 'error' | 'crawling' | 'completed' | null,
  notificationMessage: string,
  sourceId: string
): void => {
  if (!notificationType || !notificationMessage) return;
  
  const toastId = `status-update-${sourceId}-${Date.now()}`;
  
  switch(notificationType) {
    case 'completed':
      toast.success(notificationMessage, { id: toastId });
      break;
    case 'error':
      toast.error(notificationMessage, { id: toastId });
      break;
    default:
      // No default notifications for other status types
      break;
  }
};

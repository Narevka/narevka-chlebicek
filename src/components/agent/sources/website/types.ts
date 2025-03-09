
export interface WebsiteItem {
  id: string;
  url: string;
  title: string;
  chars: number;
  isProcessed?: boolean;
}

export interface SpiderJob {
  id: string;
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
  result_count: number;
}

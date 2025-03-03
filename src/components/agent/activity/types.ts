
export interface Conversation {
  id: string;
  title: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  confidence?: number;
  hasFeedback?: boolean;
}

export interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  confidence?: number;
  created_at: string;
  has_thumbs_up?: boolean;
  has_thumbs_down?: boolean;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface FilterState {
  source: string | null;
  confidenceScore: string | null;
  feedback: string | null;
  dateRange: string | null;
}

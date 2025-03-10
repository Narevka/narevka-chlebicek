export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  source: string;
  is_public?: boolean;
  // Added properties for UI display
  last_message?: string;
  user_message?: string;
  confidence?: number | null;
  hasFeedback?: boolean;
}

export interface Message {
  id?: string;
  conversation_id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
  confidence?: number;
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

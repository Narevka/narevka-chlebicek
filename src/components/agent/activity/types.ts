
export interface Conversation {
  id: string;
  title: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  confidence?: number;
  created_at: string;
}

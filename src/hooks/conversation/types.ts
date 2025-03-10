
export interface Message {
  id?: string;
  content: string;
  isUser: boolean;
  confidence?: number;
  created_at?: string;
  has_thumbs_up?: boolean;
  has_thumbs_down?: boolean;
}

export interface ConversationState {
  messages: Array<Message>;
  inputMessage: string;
  sendingMessage: boolean;
  conversationId: string | null;
  threadId: string | null;
}

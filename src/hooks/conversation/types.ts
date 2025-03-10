
export interface Message {
  id?: string;
  content: string;
  isUser: boolean;
  confidence?: number;
  created_at?: string;
}

export interface ConversationState {
  messages: Array<Message>;
  inputMessage: string;
  sendingMessage: boolean;
  conversationId: string | null;
  threadId: string | null;
}

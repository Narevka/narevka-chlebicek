
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  confidence?: number;
}

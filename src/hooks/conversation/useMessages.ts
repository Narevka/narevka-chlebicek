
import { useState, useCallback } from 'react';
import { Message } from '../conversation/types';

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  return {
    messages,
    addMessage,
    setMessages
  };
};


import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from './types';

export const STORAGE_KEY_PREFIX = 'chat_messages_';

export const useMessages = (conversationId: string | null, source: string) => {
  // Create a storage key that's specific to both the conversation ID and source
  const storageKey = useRef(`${STORAGE_KEY_PREFIX}${source}_${conversationId || 'new'}`);
  
  // Initialize messages from storage if available, otherwise use default welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    // Only attempt to load from storage if we have a conversation ID
    if (conversationId) {
      try {
        const storedMessages = sessionStorage.getItem(storageKey.current);
        if (storedMessages) {
          return JSON.parse(storedMessages);
        }
      } catch (e) {
        console.error('Failed to load messages from storage:', e);
      }
    }
    
    // Default message
    return [{ 
      content: "Hi! What can I help you with?", 
      isUser: false 
    }];
  });
  
  // Persist messages to session storage whenever they change
  useEffect(() => {
    if (conversationId) {
      try {
        sessionStorage.setItem(storageKey.current, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save messages to storage:', e);
      }
    }
  }, [messages, conversationId, storageKey]);
  
  // Update storage key when conversation ID changes
  useEffect(() => {
    storageKey.current = `${STORAGE_KEY_PREFIX}${source}_${conversationId || 'new'}`;
    
    // Load messages for the new conversation ID
    if (conversationId) {
      try {
        const storedMessages = sessionStorage.getItem(storageKey.current);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        } else {
          // Reset to default for new conversations
          setMessages([{ 
            content: "Hi! What can I help you with?", 
            isUser: false 
          }]);
        }
      } catch (e) {
        console.error('Failed to load messages for new conversation:', e);
      }
    }
  }, [conversationId, source]);
  
  // Add a new message to the conversation
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check for duplicate messages (same content and isUser value)
      const isDuplicate = prev.some(m => 
        m.content === message.content && 
        m.isUser === message.isUser
      );
      
      if (isDuplicate) {
        console.log('Prevented duplicate message:', message.content.substring(0, 20));
        return prev;
      }
      
      return [...prev, message];
    });
  }, []);
  
  // Hard reset all messages (useful when switching sources or for debugging)
  const resetMessages = useCallback(() => {
    setMessages([{ 
      content: "Hi! What can I help you with?", 
      isUser: false 
    }]);
    
    // Also clear from storage
    if (conversationId) {
      sessionStorage.removeItem(storageKey.current);
    }
  }, [conversationId, storageKey]);
  
  return {
    messages,
    addMessage,
    setMessages,
    resetMessages
  };
};

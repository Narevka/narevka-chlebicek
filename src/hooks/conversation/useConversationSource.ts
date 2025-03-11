
import { useState, useEffect, useCallback } from 'react';
import { createConversation } from './conversationDb';

// Define valid source types for better type safety
export type SourceType = 'Playground' | 'embedded' | 'Website' | 'WordPress' | 'Bubble' | string;

// Storage key constants
const CURRENT_CONVERSATION_PREFIX = 'current_conversation_';
const SOURCE_LABEL_PREFIX = 'source_label_for_';

export const useConversationSource = (userId: string | undefined, initialSource: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Normalize source name consistently
  const normalizeSource = useCallback((source: string): SourceType => {
    if (source.toLowerCase().includes("playground")) return "Playground";
    if (source.toLowerCase().includes("embed")) return "embedded";
    if (source.toLowerCase().includes("website")) return "Website";
    if (source.toLowerCase().includes("wordpress")) return "WordPress";
    if (source.toLowerCase().includes("bubble")) return "Bubble";
    return source;
  }, []);
  
  // Get the normalized source
  const source = normalizeSource(initialSource);
  
  useEffect(() => {
    const loadConversation = async () => {
      if (!userId) return;
      
      console.log(`Loading conversation for user: ${userId}, source: ${source}`);
      
      // Get existing conversation ID from session storage
      const storageKey = `${CURRENT_CONVERSATION_PREFIX}${source}`;
      const existingId = sessionStorage.getItem(storageKey);
      
      if (existingId) {
        console.log(`Found existing conversation in session storage: ${existingId}`);
        setConversationId(existingId);
        return;
      }
      
      // Create a new conversation
      const newId = await createConversation(userId, source);
      if (newId) {
        console.log(`Created new conversation: ${newId}`);
        setConversationId(newId);
        
        // Store in session storage with normalized source
        sessionStorage.setItem(storageKey, newId);
        sessionStorage.setItem(`${SOURCE_LABEL_PREFIX}${newId}`, source);
      }
    };
    
    loadConversation();
  }, [userId, source, normalizeSource]);
  
  const resetConversation = useCallback(async () => {
    if (!userId) return;
    
    console.log(`Resetting conversation for source: ${source}`);
    
    // Clear existing conversation from session storage
    const storageKey = `${CURRENT_CONVERSATION_PREFIX}${source}`;
    sessionStorage.removeItem(storageKey);
    
    // Also clear messages
    sessionStorage.removeItem(`chat_messages_${source}_${conversationId || 'new'}`);
    
    // Create new conversation
    const newId = await createConversation(userId, source);
    if (newId) {
      console.log(`Created new conversation after reset: ${newId}`);
      setConversationId(newId);
      
      // Store in session storage with normalized source
      sessionStorage.setItem(storageKey, newId);
      sessionStorage.setItem(`${SOURCE_LABEL_PREFIX}${newId}`, source);
    }
  }, [userId, source, conversationId, normalizeSource]);
  
  return {
    conversationId,
    source, // Return the normalized source
    resetConversation
  };
};

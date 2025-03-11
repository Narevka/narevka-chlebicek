
import { useState, useEffect } from 'react';
import { createConversation } from './conversationDb';

export const useConversationSource = (userId: string | undefined, initialSource: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Normalize source name
  const source = initialSource.toLowerCase().includes("playground") ? "Playground" : 
                initialSource.toLowerCase().includes("embed") ? "embedded" : 
                initialSource;
                
  useEffect(() => {
    const loadConversation = async () => {
      if (!userId) return;
      
      const newId = await createConversation(userId, source);
      if (newId) {
        setConversationId(newId);
      }
    };
    
    loadConversation();
  }, [userId, source]);
  
  const resetConversation = async () => {
    if (!userId) return;
    
    // Clear existing conversation
    sessionStorage.removeItem(`current_conversation_${source}`);
    
    // Create new conversation
    const newId = await createConversation(userId, source);
    if (newId) {
      setConversationId(newId);
    }
  };
  
  return {
    conversationId,
    resetConversation
  };
};

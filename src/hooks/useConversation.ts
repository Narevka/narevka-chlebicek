
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./conversation/types";
import { saveMessageToDb } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";
import { useConversationSource } from "./conversation/useConversationSource";
import { useMessages } from "./conversation/useMessages";

export const useConversation = (userId: string | undefined, agentId: string | undefined, initialSource: string = "Playground") => {
  // Get conversation ID and normalized source
  const { conversationId, source: normalizedSource, resetConversation: resetConversationSource } = useConversationSource(userId, initialSource);
  
  // Get messages specific to this conversation and source
  const { messages, addMessage, setMessages, resetMessages } = useMessages(conversationId, normalizedSource);
  
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentSource, setCurrentSource] = useState(normalizedSource);

  useEffect(() => {
    // Update current source if the normalized source changes
    if (normalizedSource && normalizedSource !== currentSource) {
      console.log(`Source changed from ${currentSource} to ${normalizedSource}`);
      setCurrentSource(normalizedSource);
    }
  }, [normalizedSource, currentSource]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId || isInitializing) return;
    
    setSendingMessage(true);
    
    try {
      console.log(`Sending message using source: ${currentSource}`);
      
      // Add user message to UI immediately
      const userMessage = {
        id: uuidv4(),
        content: message,
        isUser: true,
        created_at: new Date().toISOString()
      };
      
      addMessage(userMessage);
      setInputMessage("");
      
      // Save to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: message,
        is_bot: false
      });
      
      // Get AI response
      const { botResponse, threadId: newThreadId, source: responseSource } = 
        await getAssistantResponse(message, agentId, threadId, currentSource);
      
      if (newThreadId && !threadId) {
        setThreadId(newThreadId);
      }
      
      // Update source if it changed
      if (responseSource && responseSource !== currentSource) {
        console.log(`Source updated from ${currentSource} to ${responseSource}`);
        setCurrentSource(responseSource);
      }
      
      // Add bot response to UI
      addMessage({
        ...botResponse,
        isUser: false
      });
      
      // Save bot response to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
    } catch (error) {
      console.error("Error in message handling:", error);
      toast.error("Failed to get response");
    } finally {
      setSendingMessage(false);
    }
  }, [conversationId, threadId, agentId, isInitializing, addMessage, currentSource]);

  // Combined reset function that handles both conversation source and messages
  const resetConversation = useCallback(async () => {
    // First reset the messages UI
    resetMessages();
    
    // Then reset the conversation in the database and storage
    await resetConversationSource();
    
    // Clear thread ID
    setThreadId(null);
    
  }, [resetMessages, resetConversationSource]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation,
    isInitializing,
    conversationId,
    source: currentSource
  };
};


import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./conversation/types";
import { saveMessageToDb, createConversation } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";
import { useConversationSource } from "./conversation/useConversationSource";
import { useMessages } from "./conversation/useMessages";

export const useConversation = (userId: string | undefined, agentId: string | undefined, source: string = "Playground") => {
  const { conversationId, resetConversation } = useConversationSource(userId, source);
  const { messages, addMessage, setMessages } = useMessages(conversationId);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId || isInitializing) return;
    
    setSendingMessage(true);
    
    try {
      // Add user message
      const userMessage = {
        id: uuidv4(),
        content: message,
        isUser: true
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
      const { botResponse, threadId: newThreadId } = await getAssistantResponse(message, agentId, threadId);
      
      if (newThreadId && !threadId) {
        setThreadId(newThreadId);
      }
      
      addMessage({
        ...botResponse,
        isUser: false
      });
      
      // Save bot response
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
  }, [conversationId, threadId, agentId, isInitializing, addMessage]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation,
    isInitializing
  };
};

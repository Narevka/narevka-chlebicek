
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle, updateConversationSource } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";

export const useConversation = (userId: string | undefined, agentId: string | undefined, source: string = "Website") => {
  const [messages, setMessages] = useState<Array<Message>>([
    { id: uuidv4(), content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Use a safer source default value with validation
  const validSource = typeof source === 'string' && source.trim() !== '' 
    ? source.trim() 
    : "Website";
  
  useEffect(() => {
    const initConversation = async () => {
      if (!userId) return;

      console.log(`useConversation: Initializing conversation with source: ${validSource}`);
      const newConversationId = await createConversation(userId, validSource);
      
      if (newConversationId) {
        setConversationId(newConversationId);
        
        await saveMessageToDb({
          conversation_id: newConversationId,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
        
        // Set initial threadId to null to ensure a new thread is created
        setThreadId(null);
      } else {
        console.error("Failed to create conversation");
        toast.error("Failed to initialize conversation");
      }
    };

    initConversation();
  }, [userId, validSource]);
  
  useEffect(() => {
    // Update conversation source whenever it changes
    if (conversationId && validSource) {
      console.log(`Updating conversation source for ${conversationId} to ${validSource}`);
      updateConversationSource(conversationId, validSource);
    }
  }, [conversationId, validSource]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId) return;
    
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    
    await saveMessageToDb({
      conversation_id: conversationId,
      content: message,
      is_bot: false
    });
    
    try {
      console.log(`Sending message with source: ${validSource} and threadId: ${threadId}`);
      const { botResponse, threadId: newThreadId } = await getAssistantResponse(
        message, 
        agentId, 
        threadId,
        validSource
      );
      
      console.log(`Received response with threadId: ${newThreadId}`);
      
      if (newThreadId) {
        console.log(`Setting new threadId: ${newThreadId}`);
        setThreadId(newThreadId);
      }
      
      setMessages(prev => [...prev, botResponse]);
      
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
      if (messages.length === 1) {
        updateConversationTitle(conversationId, userId, message);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadId, agentId, userId, messages.length, validSource]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    console.log(`Resetting conversation with source: ${validSource}`);
    const newConversationId = await createConversation(userId, validSource);
    
    if (newConversationId) {
      setConversationId(newConversationId);
      setThreadId(null); // Reset threadId to null for a fresh start
      setMessages([{ id: uuidv4(), content: "Hi! What can I help you with?", isUser: false }]);
      
      await saveMessageToDb({
        conversation_id: newConversationId,
        content: "Hi! What can I help you with?",
        is_bot: true
      });
      
      toast.success("Conversation reset");
    } else {
      toast.error("Failed to reset conversation");
    }
  }, [userId, validSource]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation
  };
};

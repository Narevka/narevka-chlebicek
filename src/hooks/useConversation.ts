
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message, ConversationState } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";

// Export the Message type with the correct syntax for isolatedModules
export type { Message };

export const useConversation = (userId: string | undefined, agentId: string | undefined, source: string = "Playground") => {
  const [messages, setMessages] = useState<Array<Message>>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Ensure source is a valid string
  const validSource = typeof source === 'string' && source.trim() !== '' 
    ? source.trim() 
    : "Playground";

  useEffect(() => {
    // Create a new conversation when component mounts
    const initConversation = async () => {
      if (!userId) return;

      console.log(`useConversation: Initializing conversation with source: ${validSource}`);
      const newConversationId = await createConversation(userId, validSource);
      
      if (newConversationId) {
        setConversationId(newConversationId);
        
        // Save initial bot message
        await saveMessageToDb({
          conversation_id: newConversationId,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
      } else {
        console.error("Failed to create conversation");
        toast.error("Failed to initialize conversation");
      }
    };

    initConversation();
  }, [userId, validSource]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId) return;
    
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    
    // Save user message to database
    await saveMessageToDb({
      conversation_id: conversationId,
      content: message,
      is_bot: false
    });
    
    try {
      // Ensure source is passed to the assistant API
      console.log(`Sending message with source: ${validSource} and threadId: ${threadId}`);
      const { botResponse, threadId: newThreadId } = await getAssistantResponse(
        message, 
        agentId, 
        threadId,
        validSource // Pass source to the assistant API
      );
      
      console.log(`Received response with threadId: ${newThreadId}`);
      
      // Update thread ID if received
      if (newThreadId) {
        console.log(`Setting new threadId: ${newThreadId}`);
        setThreadId(newThreadId);
      }
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
      // Update conversation title with the first user message if it's the second message in the conversation
      if (messages.length === 1) {
        updateConversationTitle(conversationId, userId, message);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadId, agentId, userId, messages.length, validSource]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    // Create a new conversation with the same source
    console.log(`Resetting conversation with source: ${validSource}`);
    const newConversationId = await createConversation(userId, validSource);
    
    if (newConversationId) {
      setConversationId(newConversationId);
      setThreadId(null); // Reset OpenAI thread ID
      setMessages([{ content: "Hi! What can I help you with?", isUser: false }]);
      
      // Save initial bot message
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

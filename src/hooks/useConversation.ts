
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message, ConversationState } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle, updateConversationSource } from "./conversation/conversationDb";
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
  const [conversationSource] = useState<string>(source); // Store source and never change it

  console.log(`Initializing conversation with consistent source: ${conversationSource}`);

  useEffect(() => {
    // Create a new conversation when component mounts
    const initConversation = async () => {
      if (!userId) return;

      // Always use the source that was set at initialization
      console.log("Creating conversation with source:", conversationSource);
      const newConversationId = await createConversation(userId, conversationSource);
      
      if (newConversationId) {
        setConversationId(newConversationId);
        
        // Save initial bot message
        await saveMessageToDb({
          conversation_id: newConversationId,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
      }
    };

    initConversation();
  }, [userId, conversationSource]);

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
      const { botResponse, threadId: newThreadId } = await getAssistantResponse(message, agentId, threadId);
      
      // Update thread ID if it's a new conversation
      if (newThreadId && !threadId) {
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
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadId, agentId, userId, messages.length]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    // Create a new conversation with the SAME source as original initialization
    console.log("Resetting conversation with source:", conversationSource);
    const newConversationId = await createConversation(userId, conversationSource);
    
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
  }, [userId, conversationSource]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation
  };
};

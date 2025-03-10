
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

  useEffect(() => {
    // Create a new conversation when component mounts
    const initConversation = async () => {
      if (!userId) return;

      // Make sure source is a valid string
      let validSource: string;
      if (typeof source === 'string' && source.trim() !== '') {
        validSource = source;
      } else {
        console.warn(`Invalid source provided: ${source}, defaulting to "Playground"`);
        validSource = "Playground";
      }

      console.log(`Initializing conversation with source: ${validSource}`);
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
  }, [userId, source]);

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

    // Create a new conversation with the same source
    console.log("Resetting conversation with source:", source);
    const newConversationId = await createConversation(userId, source);
    
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
  }, [userId, source]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation
  };
};

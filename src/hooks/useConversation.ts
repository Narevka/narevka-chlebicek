
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
  const [isInitializing, setIsInitializing] = useState(true);

  console.log(`Initializing conversation with consistent source: ${conversationSource}`);

  // Ensure we only create one conversation
  useEffect(() => {
    let isMounted = true;
    
    // Create a new conversation when component mounts
    const initConversation = async () => {
      if (!userId) return;

      setIsInitializing(true);
      
      try {
        // Always use the source that was set at initialization and normalize it
        let normalizedSource = conversationSource;
        if (normalizedSource.toLowerCase().includes("playground")) {
          normalizedSource = "Playground";
        } else if (normalizedSource.toLowerCase().includes("embed")) {
          normalizedSource = "embedded";
        }
        
        console.log("Creating conversation with normalized source:", normalizedSource);
        
        // Check for recent conversations with same source to prevent duplicates
        const twoMinutesAgo = new Date();
        twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
        
        const { data: existingConversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('source', normalizedSource)
          .gte('created_at', twoMinutesAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);
        
        let convId;
        
        // If there's a recent conversation with the same source, use that instead
        if (existingConversations && existingConversations.length > 0) {
          convId = existingConversations[0].id;
          console.log(`Using existing conversation: ${convId} instead of creating a new one`);
        } else {
          // Create a new conversation
          convId = await createConversation(userId, normalizedSource);
          console.log(`Created new conversation: ${convId}`);
          
          if (convId) {
            // Save initial bot message only for new conversations
            await saveMessageToDb({
              conversation_id: convId,
              content: "Hi! What can I help you with?",
              is_bot: true
            });
          }
        }
        
        if (isMounted && convId) {
          setConversationId(convId);
        }
      } catch (error) {
        console.error("Error in conversation initialization:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initConversation();
    
    return () => {
      isMounted = false;
    };
  }, [userId, conversationSource]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId || isInitializing) return;
    
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
  }, [conversationId, threadId, agentId, userId, messages.length, isInitializing]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    setSendingMessage(true);
    
    try {
      // Create a new conversation with the SAME source as original initialization
      // Also normalize the source
      let normalizedSource = conversationSource;
      if (normalizedSource.toLowerCase().includes("playground")) {
        normalizedSource = "Playground";
      } else if (normalizedSource.toLowerCase().includes("embed")) {
        normalizedSource = "embedded";
      }
      
      console.log("Resetting conversation with normalized source:", normalizedSource);
      const newConversationId = await createConversation(userId, normalizedSource);
      
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
    } catch (error) {
      console.error("Error resetting conversation:", error);
      toast.error("Failed to reset conversation");
    } finally {
      setSendingMessage(false);
    }
  }, [userId, conversationSource]);

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

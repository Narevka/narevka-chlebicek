
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message, ConversationState } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle, updateConversationSource } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";
import { supabase } from "@/integrations/supabase/client";

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
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);

  console.log(`Initializing conversation with source: ${conversationSource}`);

  // Load existing conversation from both session storage and database
  useEffect(() => {
    if (!userId || hasLoadedConversation) return;
    
    // Try to get existing conversationId from sessionStorage to maintain continuity
    const loadExistingConversation = async () => {
      setIsInitializing(true);
      
      try {
        // First check session storage for an active conversation
        const sessionConversationId = sessionStorage.getItem(`current_conversation_${conversationSource}`);
        
        if (sessionConversationId) {
          console.log(`Found existing conversation in session: ${sessionConversationId}`);
          
          // Verify this conversation exists and belongs to the user
          const { data: existingConvo } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', sessionConversationId)
            .eq('user_id', userId)
            .single();
            
          if (existingConvo) {
            console.log(`Verified existing conversation: ${sessionConversationId}`);
            setConversationId(sessionConversationId);
            
            // Load the existing messages for this conversation
            const { data: messageData } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', sessionConversationId)
              .order('created_at', { ascending: true });
              
            if (messageData && messageData.length > 0) {
              console.log(`Loaded ${messageData.length} messages from existing conversation`);
              
              // Transform database messages to our Message format
              const formattedMessages = messageData.map(msg => ({
                id: msg.id,
                content: msg.content,
                isUser: !msg.is_bot,
                confidence: msg.confidence
              }));
              
              setMessages(formattedMessages);
            }
            
            setHasLoadedConversation(true);
            setIsInitializing(false);
            return true;
          } else {
            // Invalid session storage value - will create new conversation below
            console.log(`Session conversation ID ${sessionConversationId} not found in database, will create new`);
            sessionStorage.removeItem(`current_conversation_${conversationSource}`);
          }
        }
        
        // If no valid conversation in session, look for recent conversation from same source
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 30); // Extend to 30 minutes to reduce duplicates
        
        // Normalize source for consistency
        let normalizedSource = conversationSource;
        if (normalizedSource.toLowerCase().includes("playground")) {
          normalizedSource = "Playground";
        } else if (normalizedSource.toLowerCase().includes("embed")) {
          normalizedSource = "embedded";
        }
        
        const { data: recentConversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('source', normalizedSource)
          .gte('updated_at', fiveMinutesAgo.toISOString())
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (recentConversations && recentConversations.length > 0) {
          const recentId = recentConversations[0].id;
          console.log(`Found recent conversation: ${recentId} - will use this instead of creating new`);
          
          // Store in session storage for future use
          sessionStorage.setItem(`current_conversation_${normalizedSource}`, recentId);
          setConversationId(recentId);
          
          // Load the existing messages for this conversation
          const { data: messageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', recentId)
            .order('created_at', { ascending: true });
            
          if (messageData && messageData.length > 0) {
            console.log(`Loaded ${messageData.length} messages from recent conversation`);
            
            // Transform database messages to our Message format
            const formattedMessages = messageData.map(msg => ({
              id: msg.id,
              content: msg.content,
              isUser: !msg.is_bot,
              confidence: msg.confidence
            }));
            
            setMessages(formattedMessages);
          }
          
          setHasLoadedConversation(true);
          setIsInitializing(false);
          return true;
        }
        
        // If we reach here, we need to create a new conversation
        console.log("No existing conversation found, creating new one");
        const newId = await createConversation(userId, normalizedSource);
        
        if (newId) {
          console.log(`Created new conversation: ${newId}`);
          // Store in session storage for future use
          sessionStorage.setItem(`current_conversation_${normalizedSource}`, newId);
          setConversationId(newId);
          
          // Save initial bot message
          await saveMessageToDb({
            conversation_id: newId,
            content: "Hi! What can I help you with?",
            is_bot: true
          });
        }
        
        setHasLoadedConversation(true);
        setIsInitializing(false);
        return true;
      } catch (error) {
        console.error("Error loading or creating conversation:", error);
        setIsInitializing(false);
        setHasLoadedConversation(true);
        return false;
      }
    };

    loadExistingConversation();
  }, [userId, conversationSource, hasLoadedConversation]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId || isInitializing) return;
    
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    setInputMessage(""); // Clear input immediately after sending
    
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
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Failed to get response");
    } finally {
      setSendingMessage(false);
    }
  }, [conversationId, threadId, agentId, userId, messages.length, isInitializing, inputMessage, setInputMessage]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    setSendingMessage(true);
    
    try {
      // Remove the old conversation ID from session storage
      sessionStorage.removeItem(`current_conversation_${conversationSource}`);
      
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
        // Store the new conversation ID in session storage
        sessionStorage.setItem(`current_conversation_${normalizedSource}`, newConversationId);
        
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

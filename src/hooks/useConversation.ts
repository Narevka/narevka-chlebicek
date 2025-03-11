
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
  // Store original source string to prevent confusion during rendering cycles
  const [conversationSource] = useState<string>(
    // Normalize immediately on initialization 
    source?.toLowerCase().includes("playground") ? "Playground" : 
    source?.toLowerCase().includes("embed") ? "embedded" : 
    source
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);
  const [lastPageRefresh] = useState(new Date().getTime());

  console.log(`Initializing conversation with source: ${conversationSource}`);

  // Load existing conversation from both session storage and database
  useEffect(() => {
    if (!userId || hasLoadedConversation) return;
    
    // Try to get existing conversationId from sessionStorage to maintain continuity
    const loadExistingConversation = async () => {
      setIsInitializing(true);
      
      try {
        console.log(`Normalized source for loading: ${conversationSource}`);
        
        // First check session storage for an active conversation
        const sessionConversationId = sessionStorage.getItem(`current_conversation_${conversationSource}`);
        
        if (sessionConversationId) {
          console.log(`Found existing conversation in session: ${sessionConversationId}`);
          
          // Verify this conversation exists and belongs to the user
          const { data: existingConvo } = await supabase
            .from('conversations')
            .select('id, source')
            .eq('id', sessionConversationId)
            .eq('user_id', userId)
            .single();
            
          if (existingConvo) {
            console.log(`Verified existing conversation: ${sessionConversationId} with source: ${existingConvo.source}`);
            setConversationId(sessionConversationId);
            
            // If the source doesn't match our expected source, update it in the database
            if (existingConvo.source !== conversationSource) {
              console.log(`Correcting source from ${existingConvo.source} to ${conversationSource}`);
              await updateConversationSource(sessionConversationId, conversationSource);
            }
            
            // Store a verified source label
            sessionStorage.setItem('source_label_for_' + sessionConversationId, conversationSource);
            
            // Load the existing messages for this conversation
            const { data: messageData } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', sessionConversationId)
              .order('created_at', { ascending: true });
              
            if (messageData && messageData.length > 0) {
              console.log(`Loaded ${messageData.length} messages from existing conversation`);
              
              // Transform database messages to our Message format with proper isUser flag
              const formattedMessages = messageData.map(msg => ({
                id: msg.id,
                content: msg.content,
                isUser: !msg.is_bot,
                is_bot: msg.is_bot,
                confidence: msg.confidence,
                created_at: msg.created_at
              }));
              
              // Only set messages if we actually have some
              if (formattedMessages.length > 0) {
                setMessages(formattedMessages);
              }
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
        
        // Create a longer timeframe to reduce duplicate conversations
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        
        const { data: recentConversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('source', conversationSource)
          .gte('updated_at', thirtyMinutesAgo.toISOString())
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (recentConversations && recentConversations.length > 0) {
          const recentId = recentConversations[0].id;
          console.log(`Found recent conversation: ${recentId} with source ${conversationSource} - will use this instead of creating new`);
          
          // Store in session storage for future use
          sessionStorage.setItem(`current_conversation_${conversationSource}`, recentId);
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
              is_bot: msg.is_bot,
              confidence: msg.confidence,
              created_at: msg.created_at
            }));
            
            // Only set messages if we actually have some
            if (formattedMessages.length > 0) {
              setMessages(formattedMessages);
            }
          }
          
          setHasLoadedConversation(true);
          setIsInitializing(false);
          return true;
        }
        
        // If we reach here, we need to create a new conversation
        console.log("No existing conversation found, creating new one");
        const newId = await createConversation(userId, conversationSource);
        
        if (newId) {
          console.log(`Created new conversation: ${newId}`);
          // Store in session storage for future use
          sessionStorage.setItem(`current_conversation_${conversationSource}`, newId);
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
  }, [userId, conversationSource, hasLoadedConversation, lastPageRefresh]);

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
      
      // Add isUser property for UI rendering
      const formattedBotResponse = {
        ...botResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, formattedBotResponse]);
      
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
  }, [conversationId, threadId, agentId, userId, messages.length, isInitializing]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    setSendingMessage(true);
    
    try {
      // Remove the old conversation ID from session storage to prevent linking
      sessionStorage.removeItem(`current_conversation_${conversationSource}`);
      
      // Create a new conversation
      console.log("Resetting conversation with source:", conversationSource);
      const newConversationId = await createConversation(userId, conversationSource);
      
      if (newConversationId) {
        // Store the new conversation ID in session storage
        sessionStorage.setItem(`current_conversation_${conversationSource}`, newConversationId);
        
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

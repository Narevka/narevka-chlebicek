import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle, updateConversationSource } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";

const debugLog = (message: string, data?: any) => {
  console.log(`[DEBUG-CONVERSATION] ${message}`, data || '');
  
  try {
    const history = JSON.parse(localStorage.getItem('conversation_debug_history') || '[]');
    history.push({
      timestamp: new Date().toISOString(),
      message,
      data: data ? JSON.stringify(data).substring(0, 500) : undefined
    });
    localStorage.setItem('conversation_debug_history', JSON.stringify(history.slice(-50)));
  } catch (e) {
    console.error("Failed to save debug history:", e);
  }
};

export const useConversation = (userId: string | undefined, agentId: string | undefined, source: string = "Website") => {
  const [messages, setMessages] = useState<Array<Message>>([
    { id: uuidv4(), content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const threadIdRef = useRef<string | null>(null);
  const retryCount = useRef<number>(0);
  
  const validSource = typeof source === 'string' && source.trim() !== '' 
    ? source.trim() 
    : "Website";
  
  debugLog(`Initializing with source parameter: "${source}", normalized to "${validSource}"`);
  
  useEffect(() => {
    const initConversation = async () => {
      if (!userId) return;

      debugLog(`Initializing conversation with source: ${validSource}`);
      const newConversationId = await createConversation(userId, validSource);
      
      if (newConversationId) {
        setConversationId(newConversationId);
        debugLog(`Created new conversation with ID: ${newConversationId}`);
        
        await saveMessageToDb({
          conversation_id: newConversationId,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
        
        setThreadId(null);
        threadIdRef.current = null;
        debugLog(`Reset threadId to null for new conversation`);
      } else {
        console.error("Failed to create conversation");
        toast.error("Failed to initialize conversation");
      }
    };

    initConversation();
  }, [userId, validSource]);
  
  useEffect(() => {
    threadIdRef.current = threadId;
    debugLog(`Updated threadIdRef to: ${threadId || 'null'}`);
  }, [threadId]);
  
  useEffect(() => {
    if (conversationId && validSource) {
      debugLog(`Updating conversation source for ${conversationId} to ${validSource}`);
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
    debugLog(`Sending message: "${message.substring(0, 30)}..." with threadId: ${threadIdRef.current || 'null'}`);
    
    await saveMessageToDb({
      conversation_id: conversationId,
      content: message,
      is_bot: false
    });
    debugLog(`Saved user message to database for conversation: ${conversationId}`);
    
    try {
      debugLog(`Sending message to assistant API with source: ${validSource}, threadId: ${threadIdRef.current || 'null'}`);
      const { botResponse, threadId: newThreadId } = await getAssistantResponse(
        message, 
        agentId, 
        threadIdRef.current,
        validSource
      );
      
      debugLog(`Received response with threadId: ${newThreadId || 'null'}`);
      
      if (newThreadId) {
        debugLog(`Setting new threadId: ${newThreadId}`);
        setThreadId(newThreadId);
        threadIdRef.current = newThreadId;
      }
      
      setMessages(prev => [...prev, botResponse]);
      
      debugLog(`Saving bot message to database: ${botResponse.content.substring(0, 30)}...`);
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
      if (messages.length === 1) {
        debugLog(`Updating conversation title for first message`);
        updateConversationTitle(conversationId, userId, message);
      }
      
      retryCount.current = 0;
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      debugLog(`Error in handleSendMessage: ${error.message || 'Unknown error'}`);
      
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes("thread") || 
          errorMessage.toLowerCase().includes("not found")) {
        debugLog(`Thread error detected, resetting threadId to null (was: ${threadIdRef.current})`);
        setThreadId(null);
        threadIdRef.current = null;
        
        if (retryCount.current < 2) {
          retryCount.current++;
          toast.warning("Session reset. Retrying...");
          debugLog(`Retry attempt #${retryCount.current}`);
          
          setTimeout(() => {
            handleSendMessage(message);
          }, 500);
          return;
        } else {
          toast.error("Failed to establish a stable session. Please try again later.");
          retryCount.current = 0;
        }
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Sorry, I encountered a technical problem. Please try again.",
        isUser: false
      }]);
      
      await saveMessageToDb({
        conversation_id: conversationId,
        content: "Sorry, I encountered a technical problem. Please try again.",
        is_bot: true
      });
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadIdRef, agentId, userId, messages.length, validSource]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    debugLog(`Resetting conversation with source: ${validSource}`);
    const newConversationId = await createConversation(userId, validSource);
    
    if (newConversationId) {
      setConversationId(newConversationId);
      setThreadId(null);
      threadIdRef.current = null;
      setMessages([{ id: uuidv4(), content: "Hi! What can I help you with?", isUser: false }]);
      debugLog(`Created new conversation with ID: ${newConversationId}, reset threadId to null`);
      
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


import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./conversation/types";
import { 
  saveMessageToDb, 
  createConversation, 
  updateConversationTitle, 
  updateConversationSource,
  verifyConversationExists 
} from "./conversation/conversationDb";
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
  const conversationIdRef = useRef<string | null>(null);
  const threadIdRef = useRef<string | null>(null);
  const retryCount = useRef<number>(0);
  const initialMessageSaved = useRef<boolean>(false);
  
  const validSource = typeof source === 'string' && source.trim() !== '' 
    ? source.trim() 
    : "Website";
  
  debugLog(`Initializing with source parameter: "${source}", normalized to "${validSource}"`);
  
  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!userId) return;

      debugLog(`Initializing conversation with source: ${validSource}`);
      const newConversationId = await createConversation(userId, validSource);
      
      if (newConversationId) {
        setConversationId(newConversationId);
        conversationIdRef.current = newConversationId;
        debugLog(`Created new conversation with ID: ${newConversationId}`);
        
        // Save welcome message to database
        const messageId = await saveMessageToDb({
          conversation_id: newConversationId,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
        
        initialMessageSaved.current = !!messageId;
        debugLog(`Initial welcome message saved: ${initialMessageSaved.current}, messageId: ${messageId}`);
        
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
  
  // Update refs when state changes
  useEffect(() => {
    threadIdRef.current = threadId;
    debugLog(`Updated threadIdRef to: ${threadId || 'null'}`);
  }, [threadId]);
  
  useEffect(() => {
    conversationIdRef.current = conversationId;
    debugLog(`Updated conversationIdRef to: ${conversationId || 'null'}`);
  }, [conversationId]);
  
  // Update conversation source
  useEffect(() => {
    if (conversationId && validSource) {
      debugLog(`Updating conversation source for ${conversationId} to ${validSource}`);
      updateConversationSource(conversationId, validSource);
    }
  }, [conversationId, validSource]);

  // Main function to send a message and get a response
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId) {
      debugLog(`Cannot send message: ${!message.trim() ? 'Empty message' : !conversationId ? 'No conversationId' : 'No agentId'}`);
      return;
    }
    
    // Verify conversation exists first
    const conversationExists = await verifyConversationExists(conversationId);
    if (!conversationExists) {
      debugLog(`Conversation ${conversationId} does not exist, creating new conversation`);
      const newConversationId = await createConversation(userId || 'anonymous', validSource);
      if (!newConversationId) {
        toast.error("Failed to create conversation");
        return;
      }
      setConversationId(newConversationId);
      conversationIdRef.current = newConversationId;
      debugLog(`Created new conversation with ID: ${newConversationId}`);
    }
    
    // Create user message
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    debugLog(`Sending message: "${message.substring(0, 30)}..." with threadId: ${threadIdRef.current || 'null'}`);
    
    // Save user message to database
    const currentConversationId = conversationIdRef.current || conversationId;
    const userMessageId = await saveMessageToDb({
      conversation_id: currentConversationId,
      content: message,
      is_bot: false
    });
    
    debugLog(`Saved user message to database for conversation: ${currentConversationId}, messageId: ${userMessageId}`);
    
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
      const botMessageId = await saveMessageToDb({
        conversation_id: currentConversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
      debugLog(`Bot message saved with ID: ${botMessageId}`);
      
      if (messages.length === 1) {
        debugLog(`Updating conversation title for first message`);
        updateConversationTitle(currentConversationId, userId, message);
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
      
      // Add error message to UI
      const errorResponseMessage = {
        id: uuidv4(),
        content: "Sorry, I encountered a technical problem. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorResponseMessage]);
      
      // Save error message to database
      debugLog(`Saving error message to database for conversation: ${currentConversationId}`);
      await saveMessageToDb({
        conversation_id: currentConversationId,
        content: "Sorry, I encountered a technical problem. Please try again.",
        is_bot: true
      });
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadIdRef, agentId, userId, messages.length, validSource]);

  // Function to reset the conversation
  const resetConversation = useCallback(async () => {
    if (!userId) return;

    debugLog(`Resetting conversation with source: ${validSource}`);
    const newConversationId = await createConversation(userId, validSource);
    
    if (newConversationId) {
      setConversationId(newConversationId);
      conversationIdRef.current = newConversationId;
      setThreadId(null);
      threadIdRef.current = null;
      setMessages([{ id: uuidv4(), content: "Hi! What can I help you with?", isUser: false }]);
      debugLog(`Created new conversation with ID: ${newConversationId}, reset threadId to null`);
      
      const messageId = await saveMessageToDb({
        conversation_id: newConversationId,
        content: "Hi! What can I help you with?",
        is_bot: true
      });
      
      debugLog(`Reset welcome message saved with ID: ${messageId}`);
      
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
    resetConversation,
    conversationId,
    threadId
  };
};

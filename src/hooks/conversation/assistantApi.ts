
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./types";

export const getAssistantResponse = async (
  message: string,
  agentId: string,
  threadId: string | null,
  source: string = "Playground"
) => {
  try {
    // Ensure source is properly normalized
    const normalizedSource = typeof source === 'string' && source.trim() !== '' 
      ? source.trim() 
      : "Playground";

    console.log("[DEBUG] Starting request to chat-with-assistant:", { 
      message, 
      agentId, 
      threadId: threadId ? `${threadId.substring(0, 10)}...` : 'null (new thread)',
      source: normalizedSource
    });

    // Always use exactly what's passed for threadId (null or a string)
    const formattedThreadId = threadId;
    
    console.log(`[DEBUG] Using threadId: ${formattedThreadId || 'null (will create new)'}`);

    // Add local storage tracking for debugging
    try {
      const threadHistory = JSON.parse(localStorage.getItem('thread_history') || '[]');
      threadHistory.push({
        timestamp: new Date().toISOString(),
        action: 'request',
        threadId: formattedThreadId,
        message: message.substring(0, 20) + (message.length > 20 ? '...' : '')
      });
      localStorage.setItem('thread_history', JSON.stringify(threadHistory.slice(-20)));
    } catch (e) {
      console.error("[DEBUG] Failed to store thread history:", e);
    }

    const response = await supabase.functions.invoke('chat-with-assistant', {
      body: { 
        message,
        agentId,
        conversationId: formattedThreadId,
        source: normalizedSource,
        debug: true // Enable debug mode
      }
    });
    
    if (response.error) {
      console.error("[DEBUG] Error from chat-with-assistant:", response.error);
      
      // Check if it's a thread not found error with more comprehensive patterns
      if (response.error.message && (
          response.error.message.includes("thread") || 
          response.error.message.includes("Thread") || 
          response.error.message.includes("ThreadNotFound") || 
          response.error.message.includes("not found"))) {
        console.log("[DEBUG] Thread not found error from API, will reset thread in UI");
        throw new Error("ThreadNotFound: Thread session has expired");
      }
      
      throw new Error(response.error.message || "Failed to get assistant response");
    }
    
    console.log("[DEBUG] Response from chat-with-assistant:", response.data);
    
    // Check if there was an error in the response body
    if (response.data.error) {
      console.error("[DEBUG] Error in response body:", response.data.error);
      throw new Error(response.data.error);
    }
    
    // Log the threadId for debugging
    const newThreadId = response.data.threadId || null;
    console.log(`[DEBUG] Received threadId: ${newThreadId || 'none'}`);
    
    // Add local storage tracking for debugging (response)
    try {
      const threadHistory = JSON.parse(localStorage.getItem('thread_history') || '[]');
      threadHistory.push({
        timestamp: new Date().toISOString(),
        action: 'response',
        oldThreadId: formattedThreadId,
        newThreadId: newThreadId,
        responseStart: response.data.response ? response.data.response.substring(0, 20) + '...' : 'no response'
      });
      localStorage.setItem('thread_history', JSON.stringify(threadHistory.slice(-20)));
    } catch (e) {
      console.error("[DEBUG] Failed to store thread history:", e);
    }
    
    const botResponse: Message = { 
      id: uuidv4(),
      content: response.data.response || "I'm sorry, I couldn't generate a response.", 
      isUser: false,
      confidence: response.data.confidence || 0.75
    };
    
    return {
      botResponse,
      threadId: newThreadId
    };
  } catch (error: any) {
    console.error("[DEBUG] Error getting assistant response:", error);
    
    // If it's a thread not found error, propagate it specially with more comprehensive pattern matching
    if (error.message && (
        error.message.includes("thread") || 
        error.message.includes("Thread") || 
        error.message.includes("ThreadNotFound") || 
        error.message.includes("not found"))) {
      console.log("[DEBUG] Thread error detected, will be handled by caller");
      throw error; // Let the caller handle this special case
    }
    
    // For other errors, give a generic message to the user
    toast.error(error.message || "Failed to get assistant response");
    
    return {
      botResponse: { 
        id: uuidv4(),
        content: "Sorry, I encountered an error processing your request. Please try again.", 
        isUser: false
      },
      threadId: null
    };
  }
};

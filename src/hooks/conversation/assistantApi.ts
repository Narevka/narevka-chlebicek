
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

    console.log("[ASSISTANT-API] Starting request to chat-with-assistant:", { 
      message: message.substring(0, 30) + (message.length > 30 ? '...' : ''), 
      agentId, 
      threadId: threadId ? `${threadId.substring(0, 10)}...` : 'null (new thread)',
      source: normalizedSource
    });

    // Add local storage tracking for debugging
    try {
      const apiCalls = JSON.parse(localStorage.getItem('assistant_api_calls') || '[]');
      apiCalls.push({
        timestamp: new Date().toISOString(),
        action: 'request',
        threadId: threadId,
        agentId: agentId,
        message: message.substring(0, 20) + (message.length > 20 ? '...' : ''),
        source: normalizedSource
      });
      localStorage.setItem('assistant_api_calls', JSON.stringify(apiCalls.slice(-30)));
    } catch (e) {
      console.error("[ASSISTANT-API] Failed to store API call in localStorage:", e);
    }

    // Make the API call with comprehensive debug info
    const response = await supabase.functions.invoke('chat-with-assistant', {
      body: { 
        message,
        agentId,
        conversationId: threadId,
        source: normalizedSource,
        debug: true,
        clientInfo: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          viewportWidth: window.innerWidth
        }
      }
    });
    
    if (response.error) {
      console.error("[ASSISTANT-API] Error from chat-with-assistant:", response.error);
      
      // Check if it's a thread not found error with comprehensive patterns
      if (response.error.message && (
          response.error.message.toLowerCase().includes("thread") || 
          response.error.message.toLowerCase().includes("not found"))) {
        console.log("[ASSISTANT-API] Thread not found error from API, will reset thread in UI");
        throw new Error("ThreadNotFound: Thread session has expired");
      }
      
      throw new Error(response.error.message || "Failed to get assistant response");
    }
    
    console.log("[ASSISTANT-API] Response from chat-with-assistant:", response.data);
    
    // Check if there was an error in the response body
    if (response.data.error) {
      console.error("[ASSISTANT-API] Error in response body:", response.data.error);
      throw new Error(response.data.error);
    }
    
    // Log the threadId for debugging
    const newThreadId = response.data.threadId || null;
    console.log(`[ASSISTANT-API] Received threadId: ${newThreadId || 'none'}`);
    
    // Track response in localStorage for debugging
    try {
      const apiResponses = JSON.parse(localStorage.getItem('assistant_api_responses') || '[]');
      apiResponses.push({
        timestamp: new Date().toISOString(),
        requestThreadId: threadId,
        responseThreadId: newThreadId,
        responseStatus: 'success',
        responsePreview: response.data.response ? response.data.response.substring(0, 30) + '...' : 'no response',
        debug: response.data.debug || {}
      });
      localStorage.setItem('assistant_api_responses', JSON.stringify(apiResponses.slice(-30)));
    } catch (e) {
      console.error("[ASSISTANT-API] Failed to store API response in localStorage:", e);
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
    console.error("[ASSISTANT-API] Error getting assistant response:", error);
    
    // Track error in localStorage for debugging
    try {
      const apiErrors = JSON.parse(localStorage.getItem('assistant_api_errors') || '[]');
      apiErrors.push({
        timestamp: new Date().toISOString(),
        threadId: threadId,
        errorMessage: error.message || 'Unknown error',
        errorType: error.name || 'Error',
        stack: error.stack ? error.stack.substring(0, 200) + '...' : 'no stack'
      });
      localStorage.setItem('assistant_api_errors', JSON.stringify(apiErrors.slice(-30)));
    } catch (e) {
      console.error("[ASSISTANT-API] Failed to store API error in localStorage:", e);
    }
    
    // If it's a thread not found error, propagate it specially with more comprehensive pattern matching
    if (error.message && (
        error.message.toLowerCase().includes("thread") || 
        error.message.toLowerCase().includes("not found"))) {
      console.log("[ASSISTANT-API] Thread error detected, will be handled by caller");
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

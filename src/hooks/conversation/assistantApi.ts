
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

    console.log("Starting request to chat-with-assistant:", { 
      message, 
      agentId, 
      threadId: threadId ? `${threadId.substring(0, 10)}...` : 'new', 
      source: normalizedSource
    });

    // Always use exactly what's passed for threadId (null or a string)
    const formattedThreadId = threadId;
    
    console.log(`Using threadId: ${formattedThreadId || 'null (will create new)'}`);

    const response = await supabase.functions.invoke('chat-with-assistant', {
      body: { 
        message,
        agentId,
        conversationId: formattedThreadId,
        source: normalizedSource
      }
    });
    
    if (response.error) {
      console.error("Error from chat-with-assistant:", response.error);
      
      // Check if it's a thread not found error
      if (response.error.message && (
          response.error.message.includes("Thread not found") || 
          response.error.message.includes("ThreadNotFound") || 
          response.error.message.includes("No thread found"))) {
        console.log("Thread not found error from API, will reset thread in UI");
        throw new Error("ThreadNotFound: Thread session has expired");
      }
      
      throw new Error(response.error.message || "Failed to get assistant response");
    }
    
    console.log("Response from chat-with-assistant:", response.data);
    
    // Check if there was an error in the response body
    if (response.data.error) {
      console.error("Error in response body:", response.data.error);
      throw new Error(response.data.error);
    }
    
    const newThreadId = response.data.threadId || null;
    console.log(`Received new threadId: ${newThreadId || 'none'}`);
    
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
    console.error("Error getting assistant response:", error);
    
    // If it's a thread not found error, propagate it specially
    if (error.message && (
        error.message.includes("Thread not found") || 
        error.message.includes("ThreadNotFound") || 
        error.message.includes("No thread found"))) {
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

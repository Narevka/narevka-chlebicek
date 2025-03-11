
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./types";

export const getAssistantResponse = async (
  message: string,
  agentId: string,
  threadId: string | null
) => {
  try {
    // Call our edge function to get a response from the assistant
    const responseData = await supabase.functions.invoke('chat-with-assistant', {
      body: { 
        message: message,
        agentId: agentId,
        conversationId: threadId
      }
    });
    
    if (responseData.error) {
      throw new Error(responseData.error.message || "Failed to get assistant response");
    }
    
    const newThreadId = responseData.data.threadId || null;
    
    const botResponse: Message = { 
      id: uuidv4(),
      content: responseData.data.response || "I'm sorry, I couldn't generate a response.", 
      isUser: false,
      confidence: responseData.data.confidence || 0.75
    };
    
    return {
      botResponse,
      threadId: newThreadId
    };
  } catch (error: any) {
    console.error("Error getting assistant response:", error);
    toast.error(error.message || "Failed to get assistant response");
    
    // Return error message
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

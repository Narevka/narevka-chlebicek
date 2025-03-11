
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/agent/activity/types";
import { Message as UIMessage } from "@/hooks/conversation/types";

export const fetchMessagesForConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    console.log(`Fetching messages for conversation: ${conversationId}`);
    
    // Get messages for the conversation
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`No messages found for conversation: ${conversationId}`);
      return [];
    }
    
    console.log(`Found ${data.length} messages for conversation: ${conversationId}`);

    // Data is already in the Activity Message format, so we return it directly
    return data as Message[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
};

// Add a utility function to convert between message formats
export const convertUIMessageToActivityMessage = (message: UIMessage, conversationId: string): Message => {
  return {
    id: message.id,
    conversation_id: conversationId,
    content: message.content,
    is_bot: !message.isUser,
    created_at: message.created_at || new Date().toISOString(),
    confidence: message.confidence,
    has_thumbs_up: message.has_thumbs_up,
    has_thumbs_down: message.has_thumbs_down
  };
};

export const convertActivityMessageToUIMessage = (message: Message): UIMessage => {
  return {
    id: message.id,
    content: message.content,
    isUser: !message.is_bot,
    created_at: message.created_at,
    confidence: message.confidence,
    has_thumbs_up: message.has_thumbs_up,
    has_thumbs_down: message.has_thumbs_down
  };
};

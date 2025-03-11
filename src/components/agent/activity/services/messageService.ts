
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message, MessageFromDB } from "@/hooks/conversation/types";

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

    // Convert database message format to UI message format
    const messages: Message[] = data.map((msg: MessageFromDB) => ({
      id: msg.id,
      content: msg.content,
      isUser: !msg.is_bot, // Important: Convert is_bot to isUser
      created_at: msg.created_at,
      confidence: msg.confidence,
      has_thumbs_up: msg.has_thumbs_up,
      has_thumbs_down: msg.has_thumbs_down
    }));

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
};

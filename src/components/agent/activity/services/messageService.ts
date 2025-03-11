import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "../types";

export const fetchMessagesForConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    // Get messages for the conversation
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // More aggressive deduplication for messages
    const uniqueMessages: Message[] = [];
    const contentMap = new Map<string, boolean>();
    
    data?.forEach(msg => {
      // Create a unique key from content + is_bot
      // This will deduplicate messages with the same content and same sender
      // regardless of timestamp - handles the case where the same message appears multiple times
      const key = `${msg.content}-${msg.is_bot}`;
      
      if (!contentMap.has(key)) {
        contentMap.set(key, true);
        uniqueMessages.push(msg);
      } else {
        console.log(`Filtered out duplicate message: ${msg.content.substring(0, 30)}...`);
      }
    });

    console.log(`Filtered ${data?.length || 0} messages down to ${uniqueMessages.length} unique messages`);
    
    return uniqueMessages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
};

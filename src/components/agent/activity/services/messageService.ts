
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "../types";

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

    // Enhanced duplicate message detection - even more aggressive
    const uniqueMessages: Message[] = [];
    const contentMap = new Map<string, boolean>();
    
    data?.forEach(msg => {
      // Create an even more strict unique key from content + is_bot + a smaller time window
      // This catches more duplicates that are sent within very close time frames
      const timeKey = Math.floor(new Date(msg.created_at).getTime() / 1000); // 1 second window
      const key = `${msg.content.trim().substring(0, 50)}-${msg.is_bot}-${timeKey}`;
      
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


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

    if (!data || data.length === 0) {
      console.log(`No messages found for conversation: ${conversationId}`);
      return [];
    }
    
    console.log(`Found ${data.length} messages for conversation: ${conversationId}`);

    // Even more aggressive duplicate detection
    const uniqueMessages: Message[] = [];
    const contentMap = new Map<string, boolean>();
    
    data.forEach(msg => {
      // Create a key based on message content hash and user/bot flag
      const contentPreview = msg.content.trim().substring(0, 60);
      const timeKey = Math.floor(new Date(msg.created_at).getTime() / 500); // 0.5 second window
      const key = `${contentPreview}-${msg.is_bot}-${timeKey}`;
      
      if (!contentMap.has(key)) {
        contentMap.set(key, true);
        uniqueMessages.push(msg);
      } else {
        console.log(`Filtered out duplicate message: "${contentPreview.substring(0, 30)}..."`);
      }
    });

    console.log(`Filtered ${data.length} messages down to ${uniqueMessages.length} unique messages`);
    
    return uniqueMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
};


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
    const timeWindowMs = 8000; // 8 second window for deduplication (increased from 5 seconds)
    
    data.forEach(msg => {
      // Create a key based on message content hash and user/bot flag
      const contentPreview = msg.content.trim().substring(0, 200); // Increased from 150 to 200 chars
      const msgTime = new Date(msg.created_at).getTime();
      const key = `${contentPreview.substring(0, 100)}-${msg.is_bot}`; // Increased from 80 to 100 chars
      
      // Check if a very similar message exists within a small time window
      const isDuplicate = uniqueMessages.some(existingMsg => {
        const existingKey = `${existingMsg.content.trim().substring(0, 100)}-${existingMsg.is_bot}`;
        const existingTime = new Date(existingMsg.created_at).getTime();
        return (
          key === existingKey && 
          Math.abs(msgTime - existingTime) < timeWindowMs
        );
      });
      
      if (!isDuplicate && !contentMap.has(key)) {
        contentMap.set(key, true);
        uniqueMessages.push({
          id: msg.id,
          conversation_id: msg.conversation_id,
          content: msg.content,
          is_bot: msg.is_bot,
          created_at: msg.created_at,
          confidence: msg.confidence,
          has_thumbs_up: msg.has_thumbs_up,
          has_thumbs_down: msg.has_thumbs_down
        });
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

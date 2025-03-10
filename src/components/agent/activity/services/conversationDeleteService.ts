
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Delete associated messages first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) throw messagesError;
    
    // Then delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) throw error;
    
    toast.success("Conversation deleted");
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
};

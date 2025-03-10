
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Get the user ID from the current session for security
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      toast.error("You must be logged in to delete conversations");
      return false;
    }

    // Delete associated messages first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) throw messagesError;
    
    // Then delete the conversation, ensuring it belongs to the current user
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId); // Important: only delete if it belongs to the current user
    
    if (error) throw error;
    
    toast.success("Conversation deleted");
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
};

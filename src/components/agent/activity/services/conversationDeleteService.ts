
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Get the user ID from the current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      toast.error("You must be logged in to delete conversations");
      return false;
    }

    // First verify the conversation belongs to the user
    const { data: conversationData, error: verifyError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !conversationData) {
      toast.error("Conversation not found or access denied");
      return false;
    }

    // Delete associated messages first within a transaction
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      throw messagesError;
    }
    
    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      throw conversationError;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
};

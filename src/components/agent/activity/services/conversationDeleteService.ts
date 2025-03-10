
import { supabase } from "@/integrations/supabase/client";

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    console.log("Deleting conversation:", conversationId);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error("No user ID found for deletion");
      return false;
    }

    // First delete all messages associated with the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return false;
    }
    
    // Then delete the conversation itself
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      return false;
    }
    
    console.log("Successfully deleted conversation and messages for ID:", conversationId);
    return true;
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return false;
  }
};

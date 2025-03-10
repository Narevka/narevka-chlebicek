
import { supabase } from "@/integrations/supabase/client";

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) return false;

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

    return true;
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return false;
  }
};

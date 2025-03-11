
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const saveMessageToDb = async (messageData: {
  conversation_id: string;
  content: string;
  is_bot: boolean;
  confidence?: number;
  has_thumbs_up?: boolean;
  has_thumbs_down?: boolean;
}) => {
  try {
    console.log(`Saving message to conversation ${messageData.conversation_id}`, {
      is_bot: messageData.is_bot,
      preview: messageData.content.substring(0, 30) + (messageData.content.length > 30 ? '...' : '')
    });
    
    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) throw error;
    
    console.log("Message saved successfully");
  } catch (error) {
    console.error("Error saving message:", error);
    toast.error("Failed to save message");
  }
};

export const createConversation = async (userId: string, source: string = "Playground") => {
  try {
    // Ensure source is valid and consistent
    // This is crucial for preventing duplicates
    const validSource = source || "Playground";
    console.log("Creating new conversation for user:", userId, "source:", validSource);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: "New conversation",
        source: validSource
      })
      .select('id')
      .single();

    if (error) throw error;
    
    console.log("Created conversation with ID:", data.id, "source:", validSource);
    return data.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const updateConversationTitle = async (conversationId: string, userId: string | undefined, newTitle: string) => {
  if (!conversationId || !userId) return;

  try {
    console.log("Updating conversation title:", conversationId, "new title:", newTitle);
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation title:", error);
  }
};

export const updateConversationSource = async (conversationId: string, source: string) => {
  if (!conversationId) return;

  try {
    console.log("Updating conversation source:", conversationId, "new source:", source);
    const { error } = await supabase
      .from('conversations')
      .update({ source: source })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation source:", error);
  }
};

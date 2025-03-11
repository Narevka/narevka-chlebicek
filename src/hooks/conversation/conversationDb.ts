
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
    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) throw error;
  } catch (error) {
    console.error("Error saving message:", error);
    toast.error("Failed to save message");
  }
};

export const createConversation = async (userId: string, source: string = "Playground") => {
  try {
    // Normalize source to prevent incorrect source values
    // If source contains "embed" or "iframe" anywhere in the string, standardize to "Website"
    // Otherwise use the provided source, with "Playground" as the default if empty
    let normalizedSource = source;
    
    if (!normalizedSource || normalizedSource.trim() === "") {
      normalizedSource = "Playground";
    } else if (normalizedSource.toLowerCase().includes("embed") || 
               normalizedSource.toLowerCase().includes("iframe")) {
      // If it's any kind of embedded chat, standardize to Website
      normalizedSource = "Website";
    }
    
    console.log("Creating new conversation for user:", userId, "normalized source:", normalizedSource);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: "New conversation",
        source: normalizedSource
      })
      .select('id')
      .single();

    if (error) throw error;
    
    console.log("Created conversation with ID:", data.id, "source:", normalizedSource);
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

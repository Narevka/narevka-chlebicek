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
    console.log("Saving message to DB:", messageData);
    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error("Error in saveMessageToDb:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error saving message:", error);
    toast.error("Failed to save message");
  }
};

export const createConversation = async (userId: string, source: string = "Website") => {
  try {
    console.log(`Creating new conversation for user: ${userId}, with source: ${source}`);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: "New conversation",
        source: source
      })
      .select('id')
      .single();

    if (error) {
      console.error("Database error creating conversation:", error);
      throw error;
    }
    
    if (!data || !data.id) {
      console.error("No data returned when creating conversation");
      return null;
    }
    
    console.log(`Created conversation with ID: ${data.id}, source: ${source}`);
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
    // Validate source value
    const validSources = ["Playground", "Website", "WordPress", "Bubble"];
    
    // Ensure source is a string
    if (typeof source !== 'string' || !source.trim()) {
      console.warn(`Invalid source provided: ${source}, defaulting to "Website"`);
      source = "Website";
    }
    
    // Try to match with valid sources (case insensitive)
    const sourceLower = source.trim().toLowerCase();
    const matchedSource = validSources.find(s => s.toLowerCase() === sourceLower);
    
    const normalizedSource = matchedSource || source.trim();
    
    console.log(`Updating conversation source: ${conversationId}, new source: ${normalizedSource}`);
    const { error } = await supabase
      .from('conversations')
      .update({ source: normalizedSource })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation source:", error);
  }
};

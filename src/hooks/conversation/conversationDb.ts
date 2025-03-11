
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

// Enhanced conversation creation with strict source validation
export const createConversation = async (userId: string, source: string = "Playground") => {
  try {
    // Validate source to prevent inconsistencies
    let validSource = source || "Playground";
    
    // Normalize source names to prevent duplicates from slight variations
    if (validSource.toLowerCase().includes("playground")) {
      validSource = "Playground";
    } else if (validSource.toLowerCase().includes("embed")) {
      validSource = "embedded";
    }
    
    console.log("Creating new conversation for user:", userId, "source:", validSource);
    
    // Prevent duplicate conversations by checking for recent similar ones
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('source', validSource)
      .gte('created_at', twoMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    // If there's a recent conversation with the same source, use that instead
    if (existingConversations && existingConversations.length > 0) {
      const existingId = existingConversations[0].id;
      console.log(`Using existing recent conversation: ${existingId} instead of creating a new one`);
      return existingId;
    }
    
    // Create a new conversation if no recent one exists
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
    // Normalize source name
    let validSource = source;
    if (validSource.toLowerCase().includes("playground")) {
      validSource = "Playground";
    } else if (validSource.toLowerCase().includes("embed")) {
      validSource = "embedded";
    }
    
    console.log("Updating conversation source:", conversationId, "new source:", validSource);
    const { error } = await supabase
      .from('conversations')
      .update({ source: validSource })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation source:", error);
  }
};

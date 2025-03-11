
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
    // Normalize source names to standard values
    let normalizedSource = source || "Playground";
    if (normalizedSource.toLowerCase().includes("playground")) {
      normalizedSource = "Playground";
    } else if (normalizedSource.toLowerCase().includes("embed")) {
      normalizedSource = "embedded";
    }
    
    console.log(`Creating new conversation for ${userId ? 'user: ' + userId : 'anonymous user'}, source: ${normalizedSource}`);
    
    // Create a unique storage key based on source
    const sourceStorageKey = `current_conversation_${normalizedSource}`;
    
    // Check for existing conversation ID in local storage
    const sessionConversationId = sessionStorage.getItem(sourceStorageKey);
    
    if (sessionConversationId) {
      console.log(`Found existing conversation in session for source ${normalizedSource}: ${sessionConversationId}`);
      
      // Verify this conversation actually exists in the database
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id, source')
        .eq('id', sessionConversationId)
        .maybeSingle();
        
      if (existingConvo) {
        console.log(`Verified existing conversation for source ${normalizedSource}: ${sessionConversationId}`);
        
        // Fix the source if it doesn't match what we expect
        if (existingConvo.source !== normalizedSource) {
          console.log(`Correcting source from ${existingConvo.source} to ${normalizedSource}`);
          await updateConversationSource(sessionConversationId, normalizedSource);
        }
        
        return sessionConversationId;
      } else {
        console.log(`Session conversation ID not found in database for source ${normalizedSource}, will create new`);
        // Remove invalid session storage value
        sessionStorage.removeItem(sourceStorageKey);
      }
    }
    
    // Create a new conversation
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
    
    const newId = data.id;
    console.log(`Created conversation with ID: ${newId}, source: ${normalizedSource}`);
    
    // Store in session storage with source-specific key
    sessionStorage.setItem(sourceStorageKey, newId);
    
    return newId;
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
    let normalizedSource = source;
    if (normalizedSource.toLowerCase().includes("playground")) {
      normalizedSource = "Playground";
    } else if (normalizedSource.toLowerCase().includes("embed")) {
      normalizedSource = "embedded";
    }
    
    console.log("Updating conversation source:", conversationId, "new source:", normalizedSource);
    const { error } = await supabase
      .from('conversations')
      .update({ source: normalizedSource })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation source:", error);
  }
};

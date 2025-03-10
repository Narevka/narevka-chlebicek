
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
    console.log("[DB-SAVE] Starting to save message to DB:", {
      conversation_id: messageData.conversation_id,
      content_preview: messageData.content.substring(0, 20) + '...',
      is_bot: messageData.is_bot,
      confidence: messageData.confidence
    });

    // Store attempt in localStorage for debugging
    try {
      const saveAttempts = JSON.parse(localStorage.getItem('message_save_attempts') || '[]');
      saveAttempts.push({
        timestamp: new Date().toISOString(),
        conversation_id: messageData.conversation_id,
        is_bot: messageData.is_bot,
        content_preview: messageData.content.substring(0, 20) + '...'
      });
      localStorage.setItem('message_save_attempts', JSON.stringify(saveAttempts.slice(-20)));
    } catch (e) {
      console.error("[DB-SAVE] Failed to store save attempt in localStorage:", e);
    }

    // Execute the actual database operation
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('id')
      .single();

    if (error) {
      console.error("[DB-SAVE] Error in saveMessageToDb:", error);
      throw error;
    }

    console.log("[DB-SAVE] Message saved successfully with ID:", data?.id);
    
    // Store success in localStorage for debugging
    try {
      const saveSuccesses = JSON.parse(localStorage.getItem('message_save_successes') || '[]');
      saveSuccesses.push({
        timestamp: new Date().toISOString(),
        message_id: data?.id,
        conversation_id: messageData.conversation_id
      });
      localStorage.setItem('message_save_successes', JSON.stringify(saveSuccesses.slice(-20)));
    } catch (e) {
      console.error("[DB-SAVE] Failed to store save success in localStorage:", e);
    }

    return data?.id;
  } catch (error) {
    console.error("[DB-SAVE] Error saving message:", error);
    toast.error("Failed to save message to database");
    return null;
  }
};

export const createConversation = async (userId: string, source: string = "Website") => {
  try {
    // Validate source - ensure it's a string and not empty
    const validSource = typeof source === 'string' && source.trim() !== '' 
      ? source.trim() 
      : "Website";
    
    console.log(`[DB-CREATE] Creating new conversation for user: ${userId}, with source: ${validSource}`);
    
    // Store attempt in localStorage for debugging
    try {
      const createAttempts = JSON.parse(localStorage.getItem('conversation_create_attempts') || '[]');
      createAttempts.push({
        timestamp: new Date().toISOString(),
        userId: userId,
        source: validSource
      });
      localStorage.setItem('conversation_create_attempts', JSON.stringify(createAttempts.slice(-20)));
    } catch (e) {
      console.error("[DB-CREATE] Failed to store create attempt in localStorage:", e);
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: "New conversation",
        source: validSource
      })
      .select('id')
      .single();

    if (error) {
      console.error("[DB-CREATE] Database error creating conversation:", error);
      throw error;
    }
    
    if (!data || !data.id) {
      console.error("[DB-CREATE] No data returned when creating conversation");
      return null;
    }
    
    console.log(`[DB-CREATE] Created conversation with ID: ${data.id}, source: ${validSource}`);
    
    // Store success in localStorage for debugging
    try {
      const createSuccesses = JSON.parse(localStorage.getItem('conversation_create_successes') || '[]');
      createSuccesses.push({
        timestamp: new Date().toISOString(),
        conversation_id: data.id,
        source: validSource
      });
      localStorage.setItem('conversation_create_successes', JSON.stringify(createSuccesses.slice(-20)));
    } catch (e) {
      console.error("[DB-CREATE] Failed to store create success in localStorage:", e);
    }
    
    return data.id;
  } catch (error) {
    console.error("[DB-CREATE] Error creating conversation:", error);
    return null;
  }
};

export const updateConversationTitle = async (conversationId: string, userId: string | undefined, newTitle: string) => {
  if (!conversationId || !userId) return;

  try {
    console.log("[DB-UPDATE] Updating conversation title:", conversationId, "new title:", newTitle);
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('id', conversationId);

    if (error) throw error;
    
    console.log("[DB-UPDATE] Conversation title updated successfully");
  } catch (error) {
    console.error("[DB-UPDATE] Error updating conversation title:", error);
  }
};

export const updateConversationSource = async (conversationId: string, source: string) => {
  if (!conversationId) return;

  try {
    // Validate source value
    const validSources = ["Playground", "Website", "WordPress", "Bubble"];
    
    // Ensure source is a string
    if (typeof source !== 'string' || !source.trim()) {
      console.warn(`[DB-UPDATE] Invalid source provided: ${source}, defaulting to "Website"`);
      source = "Website";
    }
    
    // Try to match with valid sources (case insensitive)
    const sourceLower = source.trim().toLowerCase();
    const matchedSource = validSources.find(s => s.toLowerCase() === sourceLower);
    
    const normalizedSource = matchedSource || source.trim();
    
    console.log(`[DB-UPDATE] Updating conversation source: ${conversationId}, new source: ${normalizedSource}`);
    const { error } = await supabase
      .from('conversations')
      .update({ source: normalizedSource })
      .eq('id', conversationId);

    if (error) throw error;
    
    console.log("[DB-UPDATE] Conversation source updated successfully");
  } catch (error) {
    console.error("[DB-UPDATE] Error updating conversation source:", error);
  }
};

// New function to verify if a conversation exists
export const verifyConversationExists = async (conversationId: string): Promise<boolean> => {
  if (!conversationId) return false;
  
  try {
    console.log(`[DB-VERIFY] Checking if conversation ${conversationId} exists`);
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();
    
    if (error) {
      console.error("[DB-VERIFY] Error verifying conversation:", error);
      return false;
    }
    
    const exists = !!data;
    console.log(`[DB-VERIFY] Conversation ${conversationId} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("[DB-VERIFY] Error verifying conversation:", error);
    return false;
  }
};

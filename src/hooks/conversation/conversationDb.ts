
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
    // Validate source to prevent inconsistencies - enforce standard values
    let validSource = source || "Playground";
    
    // Normalize source names to standard values
    if (validSource.toLowerCase().includes("playground")) {
      validSource = "Playground";
    } else if (validSource.toLowerCase().includes("embed")) {
      validSource = "embedded";
    }
    
    console.log("Creating new conversation for user:", userId, "source:", validSource);
    
    // Check for existing conversation ID in session storage
    const sessionConversationId = sessionStorage.getItem(`current_conversation_${validSource}`);
    if (sessionConversationId) {
      console.log(`Found existing conversation in session: ${sessionConversationId}`);
      
      // Verify this conversation actually exists in the database
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id, source')
        .eq('id', sessionConversationId)
        .single();
        
      if (existingConvo) {
        console.log(`Verified existing conversation: ${sessionConversationId}`);
        
        // Fix the source if it doesn't match what we expect
        if (existingConvo.source !== validSource) {
          console.log(`Correcting source from ${existingConvo.source} to ${validSource}`);
          await updateConversationSource(sessionConversationId, validSource);
        }
        
        // Store a verified source label
        sessionStorage.setItem('source_label_for_' + sessionConversationId, validSource);
        
        return sessionConversationId;
      } else {
        console.log(`Session conversation ID ${sessionConversationId} not found in database, will create new`);
        // Remove invalid session storage value
        sessionStorage.removeItem(`current_conversation_${validSource}`);
      }
    }
    
    // Prevent duplicate conversations by checking for recent similar ones
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('id, source')
      .eq('user_id', userId)
      .gte('created_at', tenMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    // If there's a recent conversation, use that instead
    if (existingConversations && existingConversations.length > 0) {
      const existingId = existingConversations[0].id;
      console.log(`Using existing recent conversation: ${existingId} instead of creating a new one`);
      
      // Fix the source if it doesn't match what we expect
      if (existingConversations[0].source !== validSource) {
        console.log(`Correcting source from ${existingConversations[0].source} to ${validSource}`);
        await updateConversationSource(existingId, validSource);
      }
      
      // Store in session storage for future use
      sessionStorage.setItem(`current_conversation_${validSource}`, existingId);
      
      // Store a verified source label
      sessionStorage.setItem('source_label_for_' + existingId, validSource);
      
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
    
    const newId = data.id;
    console.log("Created conversation with ID:", newId, "source:", validSource);
    
    // Store in session storage for future use
    sessionStorage.setItem(`current_conversation_${validSource}`, newId);
    
    // Store a verified source label
    sessionStorage.setItem('source_label_for_' + newId, validSource);
    
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
    
    // Update the source label in session storage
    sessionStorage.setItem('source_label_for_' + conversationId, validSource);
  } catch (error) {
    console.error("Error updating conversation source:", error);
  }
};

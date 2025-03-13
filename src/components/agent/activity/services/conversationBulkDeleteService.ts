
import { supabase } from "@/integrations/supabase/client";
import { deleteConversation } from "./conversationDeleteService";

/**
 * Deletes all conversations associated with an agent
 * First tries to delete them one by one using the standard deleteConversation service
 * If any fail, attempts a forced bulk deletion as a fallback
 */
export const deleteAllAgentConversations = async (agentId: string, userId: string): Promise<boolean> => {
  try {
    // Get all conversations for this agent
    const { data: conversations, error: fetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("agent_id", agentId);
      
    if (fetchError) {
      console.error("Error fetching conversations for deletion:", fetchError);
      return false;
    }
    
    if (!conversations || conversations.length === 0) {
      console.log("No conversations found to delete for agent:", agentId);
      return true;
    }
    
    console.log(`Found ${conversations.length} conversations to delete for agent:`, agentId);
    
    // First attempt: Delete conversations one by one properly
    let allSuccessful = true;
    for (const conversation of conversations) {
      const success = await deleteConversation(conversation.id);
      if (!success) {
        allSuccessful = false;
        console.error(`Failed to properly delete conversation ${conversation.id}`);
      }
    }
    
    if (allSuccessful) {
      console.log("Successfully deleted all conversations properly");
      return true;
    }
    
    // Second attempt: Force delete any remaining messages and conversations
    console.warn("Some conversations failed to delete properly, attempting forced deletion");
    
    // Check which conversations remain
    const { data: remainingConversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("agent_id", agentId);
      
    if (!remainingConversations || remainingConversations.length === 0) {
      console.log("No conversations remain after first deletion attempt");
      return true;
    }
    
    console.warn(`${remainingConversations.length} conversations remain, force deleting messages`);
    
    // Force delete all messages for these conversations
    const conversationIds = remainingConversations.map(c => c.id);
    await supabase
      .from("messages")
      .delete()
      .in("conversation_id", conversationIds);
      
    // Then force delete the conversations
    const { error: forcedDeleteError } = await supabase
      .from("conversations")
      .delete()
      .in("id", conversationIds)
      .eq("user_id", userId);
      
    if (forcedDeleteError) {
      console.error("Error in forced conversation deletion:", forcedDeleteError);
      return false;
    }
    
    // Verify all conversations are gone
    const { data: finalCheck } = await supabase
      .from("conversations")
      .select("id", { count: "exact" })
      .eq("agent_id", agentId);
      
    if (finalCheck && finalCheck.length > 0) {
      console.error(`Failed to delete ${finalCheck.length} conversations after multiple attempts`);
      return false;
    }
    
    console.log("Successfully deleted all conversations after forced deletion");
    return true;
  } catch (error) {
    console.error("Error in bulk conversation deletion:", error);
    return false;
  }
};

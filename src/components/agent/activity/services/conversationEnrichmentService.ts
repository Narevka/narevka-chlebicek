
import { supabase } from "@/integrations/supabase/client";
import { Conversation, FilterState } from "../types";

export const enrichConversationsWithMessages = async (
  conversations: any[],
  filters: FilterState
) => {
  try {
    // For each conversation, fetch the first user message and last bot message
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the first user message (for showing what the user asked)
        const { data: userMessageData } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conversation.id)
          .eq('is_bot', false)
          .order('created_at', { ascending: true })
          .limit(1);
          
        // Get the last bot message
        const { data: botMessageData } = await supabase
          .from('messages')
          .select('content, confidence')
          .eq('conversation_id', conversation.id)
          .eq('is_bot', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        // For the list preview, show the user's message followed by AI's response
        let preview = '';
        if (userMessageData && userMessageData.length > 0) {
          preview = `User: ${userMessageData[0].content.substring(0, 30)}${userMessageData[0].content.length > 30 ? '...' : ''}`;
        }
        if (botMessageData && botMessageData.length > 0) {
          if (preview) preview += ' • ';
          preview += `AI: ${botMessageData[0].content.substring(0, 30)}${botMessageData[0].content.length > 30 ? '...' : ''}`;
        }
        
        return {
          ...conversation,
          user_message: userMessageData && userMessageData.length > 0 ? userMessageData[0].content : null,
          last_message: preview || "Empty conversation",
          confidence: botMessageData && botMessageData.length > 0 ? botMessageData[0].confidence : null,
          hasFeedback: false
        };
      })
    );
    
    return enrichedConversations;
  } catch (error) {
    console.error("Error enriching conversations:", error);
    return conversations;
  }
};

export const fetchMessageFeedback = async (
  conversations: Conversation[],
  filters: FilterState
) => {
  if (!filters.feedback) return conversations;
  
  try {
    const enrichedWithFeedback = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const { data: feedbackData } = await supabase
            .from('messages')
            .select('has_thumbs_up, has_thumbs_down')
            .eq('conversation_id', conversation.id);
          
          const hasFeedback = feedbackData?.some(msg => 
            (filters.feedback === 'thumbs_up' && msg.has_thumbs_up) || 
            (filters.feedback === 'thumbs_down' && msg.has_thumbs_down)
          ) || false;
          
          return {
            ...conversation,
            hasFeedback
          };
        } catch (error) {
          console.error("Error with feedback filtering:", error);
          return conversation;
        }
      })
    );
    
    return enrichedWithFeedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return conversations;
  }
};

export const applyPostFetchFilters = (
  conversations: Conversation[],
  filters: FilterState
) => {
  let filteredConversations = conversations;
  
  // Handle confidence filtering (if required)
  if (filters.confidenceScore) {
    const threshold = parseFloat(filters.confidenceScore.replace('< ', ''));
    filteredConversations = filteredConversations.filter(convo => 
      convo.confidence !== null && convo.confidence < threshold
    );
  }
  
  // Handle feedback filter
  if (filters.feedback) {
    filteredConversations = filteredConversations.filter(conv => conv.hasFeedback);
  }
  
  return filteredConversations;
};

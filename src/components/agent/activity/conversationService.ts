import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, PaginationState, FilterState } from "./types";
import { toast } from "sonner";

export const fetchConversations = async (
  pagination: PaginationState,
  filters: FilterState
) => {
  try {
    // Build the count query first to get total items
    let countQuery = supabase
      .from('conversations')
      .select('*', { count: 'exact' });
    
    // Apply filters to count query
    if (filters.source && filters.source !== 'all') {
      countQuery = countQuery.eq('source', filters.source);
    }
    
    if (filters.dateRange) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      if (filters.dateRange === "last_7_days") {
        countQuery = countQuery.gte('created_at', sevenDaysAgo.toISOString());
      }
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    const totalItems = count || 0;
    
    // Build the main query for fetching conversations
    let conversationsQuery = supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(
        (pagination.currentPage - 1) * pagination.pageSize, 
        pagination.currentPage * pagination.pageSize - 1
      );
    
    // Apply same filters to main query
    if (filters.source && filters.source !== 'all') {
      conversationsQuery = conversationsQuery.eq('source', filters.source);
    }
    
    if (filters.dateRange) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      if (filters.dateRange === "last_7_days") {
        conversationsQuery = conversationsQuery.gte('created_at', sevenDaysAgo.toISOString());
      }
    }
    
    const { data: conversationsData, error: conversationsError } = await conversationsQuery;
    
    if (conversationsError) throw conversationsError;
    
    // For each conversation, fetch the first user message and last bot message
    const conversationsWithMessages = await Promise.all(
      (conversationsData || []).map(async (conversation) => {
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
        
        // Handle feedback filter
        if (filters.feedback) {
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
              user_message: userMessageData && userMessageData.length > 0 ? userMessageData[0].content : null,
              last_message: preview || "Empty conversation",
              confidence: botMessageData && botMessageData.length > 0 ? botMessageData[0].confidence : null,
              hasFeedback 
            };
          } catch (error) {
            console.error("Error with feedback filtering:", error);
            return conversation;
          }
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
    
    // Handle confidence filtering (if required)
    let filteredConversations = conversationsWithMessages;
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
    
    return { 
      conversations: filteredConversations, 
      totalItems 
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast.error("Failed to load conversations");
    return { conversations: [], totalItems: 0 };
  }
};

export const fetchMessagesForConversation = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    // Delete associated messages first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) throw messagesError;
    
    // Then delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) throw error;
    
    toast.success("Conversation deleted");
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, PaginationState, FilterState } from "./types";
import { toast } from "sonner";

export const fetchConversations = async (
  pagination: PaginationState,
  filters: FilterState
) => {
  try {
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });
    
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    
    if (filters.dateRange) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      if (filters.dateRange === "last_7_days") {
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      }
    }
    
    const { count, error: countError } = await query;
    
    if (countError) throw countError;
    
    const totalItems = count || 0;
    
    let conversationsQuery = supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(
        (pagination.currentPage - 1) * pagination.pageSize, 
        pagination.currentPage * pagination.pageSize - 1
      );
    
    if (filters.source) {
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
    
    const conversationsWithLastMessage = await Promise.all(
      (conversationsData || []).map(async (conversation) => {
        let messagesQuery = supabase
          .from('messages')
          .select('content, is_bot, confidence')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (filters.confidenceScore) {
          const threshold = parseFloat(filters.confidenceScore.replace('< ', ''));
          messagesQuery = messagesQuery.lt('confidence', threshold);
        }
        
        const { data: lastMessageData, error: lastMessageError } = await messagesQuery.maybeSingle();
        
        if (lastMessageError && lastMessageError.code !== 'PGRST116') {
          console.error("Error fetching last message:", lastMessageError);
          return conversation;
        }
        
        return {
          ...conversation,
          last_message: lastMessageData?.is_bot ? "AI: " + lastMessageData?.content : lastMessageData?.content,
          confidence: lastMessageData?.confidence
        };
      })
    );
    
    let filteredConversations = conversationsWithLastMessage;
    
    // Handle feedback filter separately if the feedback columns exist in the database
    if (filters.feedback) {
      try {
        // Check if columns exist before filtering
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .limit(1);
        
        // Only filter by feedback if the columns exist
        if (messagesData && messagesData.length > 0 && 
            ('has_thumbs_up' in messagesData[0] || 'has_thumbs_down' in messagesData[0])) {
          
          const conversationsWithFeedback = await Promise.all(
            filteredConversations.map(async (conversation) => {
              const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id);
              
              const hasFeedback = data?.some(msg => 
                (filters.feedback === "thumbs_up" && msg.has_thumbs_up) || 
                (filters.feedback === "thumbs_down" && msg.has_thumbs_down)
              );
              
              return { ...conversation, hasFeedback };
            })
          );
          
          filteredConversations = conversationsWithFeedback.filter(conv => conv.hasFeedback);
        }
      } catch (error) {
        console.error("Error with feedback filtering:", error);
      }
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

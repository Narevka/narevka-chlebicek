
import { supabase } from "@/integrations/supabase/client";
import { PaginationState, FilterState } from "../types";
import { toast } from "sonner";
import { applyFiltersToQuery } from "./conversationFilterUtils";
import { 
  enrichConversationsWithMessages, 
  fetchMessageFeedback, 
  applyPostFetchFilters 
} from "./conversationEnrichmentService";

export const fetchConversations = async (
  pagination: PaginationState,
  filters: FilterState,
  agentId?: string
) => {
  try {
    // Build the count query first to get total items
    let countQuery = supabase
      .from('conversations')
      .select('*', { count: 'exact' });
    
    // Apply agent ID filter if provided
    if (agentId) {
      countQuery = countQuery.eq('agent_id', agentId);
    }
    
    // Apply filters to count query
    countQuery = applyFiltersToQuery(countQuery, filters);
    
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
    
    // Apply agent ID filter if provided
    if (agentId) {
      conversationsQuery = conversationsQuery.eq('agent_id', agentId);
    }
    
    // Apply same filters to main query
    conversationsQuery = applyFiltersToQuery(conversationsQuery, filters);
    
    const { data: conversationsData, error: conversationsError } = await conversationsQuery;
    
    if (conversationsError) throw conversationsError;
    
    // Enrich conversations with messages
    const conversationsWithMessages = await enrichConversationsWithMessages(
      conversationsData || []
    );
    
    // Add feedback information
    const conversationsWithFeedback = await fetchMessageFeedback(
      conversationsWithMessages
    );
    
    // Apply post-fetch filters
    const filteredConversations = applyPostFetchFilters(
      conversationsWithFeedback,
      filters
    );
    
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


import { FilterState } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { applyFiltersToQuery } from "./conversationFilterUtils";

export const fetchFilteredConversations = async (
  userId: string,
  pagination: { currentPage: number, pageSize: number },
  filters: FilterState,
  agentId?: string
) => {
  try {
    // Base query
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply agent ID filter if provided
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    
    // Apply filters
    query = applyFiltersToQuery(query, filters);
    
    // Apply pagination
    const startRange = (pagination.currentPage - 1) * pagination.pageSize;
    query = query
      .order('updated_at', { ascending: false })
      .range(startRange, startRange + pagination.pageSize - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      conversations: data || [],
      totalItems: count || 0
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return {
      conversations: [],
      totalItems: 0
    };
  }
};

export const getUniqueSourcesFromConversations = (conversations: any[]) => {
  return Array.from(new Set(conversations.map(convo => convo.source))).filter(Boolean);
};

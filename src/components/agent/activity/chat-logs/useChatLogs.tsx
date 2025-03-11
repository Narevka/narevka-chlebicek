
import { useState, useEffect, useCallback } from "react";
import { Conversation, Message, FilterState } from "../types";
import { useAuth } from "@/context/AuthContext";
import { 
  fetchConversations, 
  fetchFilteredConversations, 
  getUniqueSourcesFromConversations 
} from "../services";
import { deleteConversation } from "../services/conversationDeleteService";
import { fetchMessagesForConversation } from "../services/messageService";

// Define the PaginationState type with the missing totalItems property
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems?: number; // Made optional to avoid errors
}

export const useChatLogs = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableSources, setAvailableSources] = useState<string[]>(['all']);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
  });
  const [filterOptions, setFilterOptions] = useState<FilterState>({
    source: 'all',
    dateRange: null,
    confidenceScore: null,
    feedback: null,
  });
  // Add searchTerm state separately since it's not in FilterState
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const userId = user?.id;

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Function to fetch conversations with pagination and filtering
  const fetchConversationsData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch conversations with the current pagination and filters
      const result = await fetchFilteredConversations(userId, pagination, filterOptions);
      
      setConversations(result.conversations);
      setTotalItems(result.totalItems);
      
      // Calculate total pages
      const totalPages = Math.ceil(result.totalItems / pagination.pageSize);
      setTotalPages(totalPages);
      
      // Reset if we're on a page that no longer exists
      if (pagination.currentPage > totalPages && totalPages > 0) {
        setPagination(prev => ({
          ...prev,
          currentPage: totalPages
        }));
      }
      
      // Update available sources including 'all'
      const sources = getUniqueSourcesFromConversations(result.conversations);
      setAvailableSources(['all', ...sources]);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      setError(error.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [userId, pagination, filterOptions]);

  // Function to fetch messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMessagesLoading(true);
    setMessagesError(null);
    
    try {
      const fetchedMessages = await fetchMessagesForConversation(conversationId);
      setMessages(fetchedMessages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      setMessagesError(error.message || "Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  // Function to delete a conversation
  const removeConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      // Refresh conversations after deletion
      fetchConversationsData();
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      setError(error.message || "Failed to delete conversation");
    }
  };

  // Effect to fetch filtered conversations when filter or pagination changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch conversations with the current pagination and filters
        const result = await fetchConversations(pagination, {
          ...filterOptions,
          searchTerm: searchTerm // Pass searchTerm separately
        });
        
        const filteredResult = result.conversations || [];
        
        setConversations(filteredResult);
        setTotalItems(result.totalItems);
        
        // Calculate total pages
        const totalPages = Math.ceil(result.totalItems / pagination.pageSize);
        setTotalPages(totalPages);
        
        // Reset if we're on a page that no longer exists
        if (pagination.currentPage > totalPages && totalPages > 0) {
          setPagination(prev => ({
            ...prev,
            currentPage: totalPages
          }));
        }
        
        // Update available sources including all sources
        if (filteredResult.length > 0) {
          // Fix: Make sure to filter out any null or undefined sources and properly cast to string array
          const sources = Array.from(
            new Set(
              filteredResult
                .map(convo => convo.source)
                .filter((source): source is string => typeof source === 'string' && source !== null)
            )
          );
          
          setAvailableSources(['all', ...sources]);
        }
      } catch (error) {
        console.error("Error in fetchFilteredData:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilteredData();
  }, [userId, pagination, filterOptions, searchTerm]);

  return {
    conversations,
    isLoading,
    error,
    totalItems,
    totalPages,
    pagination,
    setPagination,
    filterOptions,
    setFilterOptions,
    availableSources,
    loadMessages,
    messages,
    isMessagesLoading: isMessagesLoading,
    messagesError,
    selectedConversationId,
    removeConversation,
    searchTerm,
    setSearchTerm
  };
};

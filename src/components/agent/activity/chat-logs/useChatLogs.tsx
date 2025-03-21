
import { useState, useEffect, useCallback } from "react";
import { Conversation, Message, FilterState, PaginationState } from "../types";
import { useAuth } from "@/context/AuthContext";
import { 
  fetchConversations, 
  getUniqueSourcesFromConversations 
} from "../services";
import { deleteConversation } from "../services/conversationDeleteService";
import { fetchMessagesForConversation } from "../services/messageService";

export const useChatLogs = (agentId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableSources, setAvailableSources] = useState<string[]>(['all']);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0, // Initialize with 0
  });
  const [filterOptions, setFilterOptions] = useState<FilterState>({
    source: 'all',
    dateRange: null,
    confidenceScore: null,
    feedback: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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
      const result = await fetchConversations(pagination, filterOptions, agentId);
      
      setConversations(result.conversations);
      setTotalItems(result.totalItems);
      
      // Calculate total pages
      const totalPages = Math.ceil(result.totalItems / pagination.pageSize);
      setTotalPages(totalPages);
      
      // Reset if we're on a page that no longer exists
      if (pagination.currentPage > totalPages && totalPages > 0) {
        setPagination(prev => ({
          ...prev,
          currentPage: totalPages,
          totalItems: result.totalItems
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
  }, [userId, pagination, filterOptions, agentId]);

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
        // Pass the filter options and agentId
        const result = await fetchConversations(
          pagination, 
          filterOptions,
          agentId
        );
        
        // Apply search term filtering on the client side if needed
        let filteredResult = result.conversations || [];
        
        if (searchTerm && searchTerm.trim() !== '') {
          filteredResult = filteredResult.filter(convo => 
            convo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (convo.last_message && convo.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setConversations(filteredResult);
        setTotalItems(result.totalItems);
        
        // Calculate total pages
        const totalPages = Math.ceil(result.totalItems / pagination.pageSize);
        setTotalPages(totalPages);
        
        // Reset if we're on a page that no longer exists
        if (pagination.currentPage > totalPages && totalPages > 0) {
          setPagination(prev => ({
            ...prev,
            currentPage: totalPages,
            totalItems: result.totalItems
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
  }, [userId, pagination, filterOptions, searchTerm, agentId]);

  // Handler functions for the ChatLogsSection component
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  }, [loadMessages]);

  const handleDeleteConversation = useCallback((conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection when clicking delete
    removeConversation(conversationId);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      totalItems: totalItems // Ensure totalItems is passed
    }));
  }, [totalItems]);

  const handleFilterChange = useCallback((name: string, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filter changes
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: totalItems // Ensure totalItems is passed
    }));
  }, [totalItems]);

  const handleToggleFilterPanel = useCallback(() => {
    setShowFilterPanel(prev => !prev);
  }, []);

  const handleExport = useCallback(() => {
    // Placeholder for export functionality
    console.log("Export functionality would go here");
  }, []);

  const loadConversations = useCallback(() => {
    fetchConversationsData();
  }, [fetchConversationsData]);

  return {
    conversations,
    selectedConversation,
    conversationMessages: messages,
    isLoading,
    isLoadingMessages: isMessagesLoading,
    error,
    messagesError,
    totalItems,
    totalPages,
    pagination,
    setPagination,
    filters: filterOptions,
    searchTerm,
    setSearchTerm,
    showFilterPanel,
    availableSources,
    handleSelectConversation,
    handleDeleteConversation,
    handlePageChange,
    handleFilterChange,
    handleToggleFilterPanel,
    handleExport,
    loadConversations,
    setSelectedConversation
  };
};

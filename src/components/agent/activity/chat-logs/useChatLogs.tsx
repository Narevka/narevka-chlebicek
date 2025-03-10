
import { useState, useEffect } from "react";
import { Conversation, Message, PaginationState, FilterState } from "../types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  fetchConversations, 
  fetchMessagesForConversation, 
  deleteConversation,
  fetchFilteredConversations,
  getUniqueSourcesFromConversations
} from "../services";

// Local storage key for deleted conversation IDs
const DELETED_CONVERSATIONS_STORAGE_KEY = "deletedConversationIds";

export const useChatLogs = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    source: null,
    confidenceScore: null,
    feedback: null,
    dateRange: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [availableSources, setAvailableSources] = useState<string[]>(['Playground', 'Website', 'WordPress', 'Bubble']);
  const [deletedConversationIds, setDeletedConversationIds] = useState<Set<string>>(() => {
    // Initialize from localStorage on component mount
    try {
      const storedIds = localStorage.getItem(DELETED_CONVERSATIONS_STORAGE_KEY);
      return storedIds ? new Set(JSON.parse(storedIds)) : new Set<string>();
    } catch (error) {
      console.error("Error loading deleted IDs from localStorage:", error);
      return new Set<string>();
    }
  });

  // Persist deletedConversationIds to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        DELETED_CONVERSATIONS_STORAGE_KEY, 
        JSON.stringify(Array.from(deletedConversationIds))
      );
    } catch (error) {
      console.error("Error saving deleted IDs to localStorage:", error);
    }
  }, [deletedConversationIds]);

  useEffect(() => {
    if (!user) return;
    
    loadConversations();
  }, [user, pagination.currentPage, filters]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    if (Object.values(filters).some(value => value !== null)) {
      const { conversations: filteredConversations, totalItems } = await fetchFilteredConversations(
        user.id,
        pagination,
        filters
      );
      
      // Filter out any conversations that are marked as deleted locally
      const filteredResult = filteredConversations.filter(
        convo => !deletedConversationIds.has(convo.id)
      );
      
      setConversations(filteredResult);
      setPagination(prev => ({
        ...prev,
        totalItems: totalItems - (totalItems > 0 ? deletedConversationIds.size : 0)
      }));
      
      const sources = getUniqueSourcesFromConversations(filteredResult);
      if (sources.length > 0) {
        setAvailableSources(['all', ...sources]);
      }
    } else {
      const { conversations: loadedConversations, totalItems } = await fetchConversations(pagination, filters);
      
      // Filter out any conversations that are marked as deleted locally
      const filteredResult = loadedConversations.filter(
        convo => !deletedConversationIds.has(convo.id)
      );
      
      setConversations(filteredResult);
      setPagination(prev => ({
        ...prev,
        totalItems: totalItems - (totalItems > 0 ? deletedConversationIds.size : 0)
      }));
      
      const sources = Array.from(new Set(filteredResult.map(convo => convo.source)));
      if (sources.length > 0) {
        setAvailableSources(['all', ...sources]);
      }
    }
    
    setIsLoading(false);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    const messages = await fetchMessagesForConversation(conversation.id);
    setConversationMessages(messages);
    setIsLoadingMessages(false);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Immediately update UI to remove the conversation
    setConversations(prevConversations => 
      prevConversations.filter(convo => convo.id !== conversationId)
    );
    
    // Add to local deleted IDs set and persist to localStorage
    setDeletedConversationIds(prev => {
      const updated = new Set(prev);
      updated.add(conversationId);
      return updated;
    });
    
    // If the deleted conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setConversationMessages([]);
    }
    
    // Perform the deletion in the background without blocking UI
    try {
      const success = await deleteConversation(conversationId);
      
      if (!success) {
        // Only show error and revert if deletion failed
        toast.error("Failed to delete conversation");
        
        // Remove from deleted set
        setDeletedConversationIds(prev => {
          const updated = new Set(prev);
          updated.delete(conversationId);
          return updated;
        });
        
        // Force reload conversations
        loadConversations();
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
      
      // Remove from deleted set
      setDeletedConversationIds(prev => {
        const updated = new Set(prev);
        updated.delete(conversationId);
        return updated;
      });
      
      loadConversations();
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const matchesSearch = 
      (convo.title && convo.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (convo.user_message && convo.user_message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (convo.last_message && convo.last_message.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleToggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting conversations as ${format}...`);
    // Implementation for export functionality would go here
  };

  return {
    conversations,
    filteredConversations,
    selectedConversation,
    conversationMessages,
    searchTerm,
    setSearchTerm,
    filters,
    isLoading,
    isLoadingMessages,
    pagination,
    totalPages,
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

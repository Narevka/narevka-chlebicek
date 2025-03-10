
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
      
      setConversations(filteredConversations);
      setPagination(prev => ({
        ...prev,
        totalItems: totalItems
      }));
      
      const sources = getUniqueSourcesFromConversations(filteredConversations);
      if (sources.length > 0) {
        setAvailableSources(['all', ...sources]);
      }
    } else {
      const { conversations: loadedConversations, totalItems } = await fetchConversations(pagination, filters);
      
      setConversations(loadedConversations);
      setPagination(prev => ({
        ...prev,
        totalItems: totalItems
      }));
      
      const sources = Array.from(new Set(loadedConversations.map(convo => convo.source)));
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
    
    // If the deleted conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setConversationMessages([]);
    }
    
    // Show a temporary toast for immediate feedback
    const toastId = toast.loading("Deleting conversation...");
    
    // Perform the actual deletion in the background
    try {
      const success = await deleteConversation(conversationId);
      
      if (success) {
        toast.success("Conversation deleted successfully", {
          id: toastId,
        });
        
        // Silently refresh the conversations list in the background
        // to ensure our data stays in sync with the server
        setTimeout(() => {
          loadConversations().catch(console.error);
        }, 500);
      } else {
        // If deletion failed, revert the UI change
        toast.error("Failed to delete conversation", {
          id: toastId,
        });
        loadConversations(); // Reload to restore the conversation
      }
    } catch (error) {
      toast.error("Failed to delete conversation", {
        id: toastId,
      });
      loadConversations(); // Reload to restore the conversation
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

import { useState, useEffect } from "react";
import { Conversation, Message, PaginationState, FilterState } from "../types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  fetchConversations, 
  fetchMessagesForConversation, 
  deleteConversation 
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
    const { conversations: loadedConversations, totalItems } = await fetchConversations(pagination, filters);
    
    setConversations(loadedConversations);
    setPagination(prev => ({
      ...prev,
      totalItems: totalItems
    }));
    
    // Extract unique sources for the filter dropdown
    const sources = Array.from(new Set(loadedConversations.map(convo => convo.source)));
    if (sources.length > 0) {
      setAvailableSources(['all', ...sources]);
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
    const success = await deleteConversation(conversationId);
    if (success) {
      setConversations(conversations.filter(convo => convo.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setConversationMessages([]);
      }
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

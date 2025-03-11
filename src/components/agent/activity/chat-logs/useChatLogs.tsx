import { useState, useEffect, useCallback } from "react";
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

// Export DELETED_CONVERSATIONS_STORAGE_KEY as a constant
export const DELETED_CONVERSATIONS_STORAGE_KEY = "deletedConversationIds";

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
  const [availableSources, setAvailableSources] = useState<string[]>(['Playground', 'Website', 'WordPress', 'Bubble', 'embedded']);
  const [deletedConversationIds, setDeletedConversationIds] = useState<Set<string>>(() => {
    try {
      const storedIds = localStorage.getItem(DELETED_CONVERSATIONS_STORAGE_KEY);
      if (storedIds) {
        const parsedIds = JSON.parse(storedIds) as string[];
        console.log("Retrieved deleted IDs from localStorage:", parsedIds);
        return new Set<string>(parsedIds);
      }
    } catch (error) {
      console.error("Error loading deleted IDs from localStorage:", error);
    }
    return new Set<string>();
  });

  // Persist deletedConversationIds to localStorage whenever it changes
  useEffect(() => {
    try {
      const idsArray = Array.from(deletedConversationIds);
      console.log("Saving deleted IDs to localStorage:", idsArray);
      localStorage.setItem(
        DELETED_CONVERSATIONS_STORAGE_KEY, 
        JSON.stringify(idsArray)
      );
    } catch (error) {
      console.error("Error saving deleted IDs to localStorage:", error);
    }
  }, [deletedConversationIds]);

  // Memoize loadConversations to avoid recreation on every render
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    console.log("Loading conversations for user:", user.id);
    setIsLoading(true);
    
    try {
      let result;
      
      if (Object.values(filters).some(value => value !== null)) {
        result = await fetchFilteredConversations(
          user.id,
          pagination,
          filters
        );
      } else {
        result = await fetchConversations(pagination, filters);
      }
      
      const { conversations: loadedConversations, totalItems } = result;
      
      // Filter out deleted conversations
      const filteredResult = loadedConversations.filter(
        convo => !deletedConversationIds.has(convo.id)
      );
      
      // Deduplicate conversations with the same message content
      // This helps prevent duplicate playground/embedded conversations
      const uniqueConversations: Conversation[] = [];
      const seenMessages = new Map<string, boolean>();
      
      filteredResult.forEach(conv => {
        // Create a key based on first user message and timestamp
        // within a 10-second window to group similar conversations
        const timeKey = Math.floor(new Date(conv.created_at).getTime() / 10000);
        const firstUserMsg = conv.user_message ? conv.user_message.substring(0, 50) : '';
        const key = `${firstUserMsg}-${timeKey}`;
        
        if (!seenMessages.has(key) || 
            // Always keep Playground entries if there's a source filter applied
            (filters.source === 'Playground' && conv.source === 'Playground') ||
            // Always keep embedded entries if there's a source filter applied
            (filters.source === 'embedded' && conv.source === 'embedded')) {
          seenMessages.set(key, true);
          uniqueConversations.push(conv);
        } else {
          console.log(`Filtered out duplicate conversation: ${conv.title} (${conv.source})`);
        }
      });
      
      console.log("Loaded conversations:", {
        total: loadedConversations.length,
        filtered: filteredResult.length,
        deduplicated: uniqueConversations.length,
        sources: uniqueConversations.map(c => c.source)
      });
      
      setConversations(uniqueConversations);
      setPagination(prev => ({
        ...prev,
        totalItems: Math.max(0, totalItems - deletedConversationIds.size)
      }));
      
      // Update available sources including all sources
      if (uniqueConversations.length > 0) {
        const sources = Array.from(new Set(uniqueConversations.map(convo => convo.source))).filter(Boolean);
        setAvailableSources(['all', ...sources]);
      }
    } catch (error) {
      console.error("Error in loadConversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [user, pagination.currentPage, filters, deletedConversationIds]);

  // Load conversations when these dependencies change
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, pagination.currentPage, filters, loadConversations]);
  
  // Force reload data when user navigates back to page or refreshes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log("Page became visible, reloading conversations");
        loadConversations();
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log("Window gained focus, reloading conversations");
        loadConversations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loadConversations]);

  const handleSelectConversation = async (conversation: Conversation) => {
    console.log("Selecting conversation:", conversation.id);
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    try {
      const messages = await fetchMessagesForConversation(conversation.id);
      setConversationMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load conversation messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting conversation:", conversationId);
    
    // Immediately update UI to remove the conversation
    setConversations(prevConversations => 
      prevConversations.filter(convo => convo.id !== conversationId)
    );
    
    // Add to local deleted IDs set
    setDeletedConversationIds(prev => {
      const updated = new Set(prev);
      updated.add(conversationId);
      return updated;
    });
    
    // Also update pagination
    setPagination(prev => ({
      ...prev,
      totalItems: Math.max(0, prev.totalItems - 1)
    }));
    
    // If the deleted conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setConversationMessages([]);
    }
    
    // Perform the actual deletion in the background
    try {
      const success = await deleteConversation(conversationId);
      
      if (!success) {
        console.error("Server-side deletion failed for conversation:", conversationId);
        toast.error("Failed to delete conversation from the server");
        // Keep the local deletion even if server delete fails
      } else {
        console.log("Successfully deleted conversation from server:", conversationId);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
      // Still keep the local deletion even if there was an error
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

import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConversationsList from "./ConversationsList";
import ConversationDetails from "./ConversationDetails";
import { Conversation, Message, PaginationState, FilterState } from "./types";
import ConversationsFilter from "./ConversationsFilter";
import PaginationControls from "./PaginationControls";
import SearchBar from "./SearchBar";
import { fetchConversations, fetchMessagesForConversation, deleteConversation } from "./conversationService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ChatLogsSection = () => {
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
    }
  };

  const sources = conversations.map(convo => convo.source);

  const filteredConversations = conversations.filter(convo => {
    const matchesSearch = convo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
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

  const handleExport = (format: string) => {
    toast.success(`Exporting conversations as ${format}...`);
    // Implementation for export functionality would go here
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Chat logs</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
            onClick={loadConversations}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            className="bg-black text-white hover:bg-gray-800 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="max-h-[600px] overflow-y-auto">
          <ConversationsList 
            conversations={filteredConversations} 
            isLoading={isLoading} 
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
        
        {pagination.totalItems > 0 && (
          <PaginationControls 
            pagination={pagination}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Dialog for conversation details */}
      <ConversationDetails 
        selectedConversation={selectedConversation}
        conversationMessages={conversationMessages}
        isLoadingMessages={isLoadingMessages}
        onClose={() => setSelectedConversation(null)}
      />
    </div>
  );
};

export default ChatLogsSection;


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
      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          The chats log is divided into two parts: the conversations list and the playground where you can view the selected conversation messages.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat logs</h2>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("JSON")}>JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("PDF")}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("CSV")}>CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {showFilterPanel && (
          <div className="bg-gray-50 p-4 rounded-md border mb-4">
            <h3 className="text-sm font-medium mb-2">Filter by:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                {/* Date filter component would go here */}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
                {/* Confidence score filter component would go here */}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Source</p>
                {/* Source filter component would go here */}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Feedback</p>
                {/* Feedback filter component would go here */}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                {/* Sentiment filter component would go here */}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Topic</p>
                {/* Topic filter component would go here */}
              </div>
            </div>
          </div>
        )}

        <ConversationsFilter 
          sources={sources} 
          activeFilters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
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

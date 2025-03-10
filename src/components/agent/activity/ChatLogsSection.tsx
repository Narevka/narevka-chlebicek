
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  const handleExport = (format: string) => {
    toast.success(`Exporting conversations as ${format}...`);
    // Implementation for export functionality would go here
  };

  return (
    <div className="flex h-full">
      <div className="w-[400px] border-r">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Chat logs</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadConversations}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <SearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {showFilterPanel && (
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Filters</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="source-filter" className="text-xs">Source</Label>
                  <Select 
                    value={filters.source || 'all'} 
                    onValueChange={(value) => handleFilterChange('source', value === 'all' ? null : value)}
                  >
                    <SelectTrigger id="source-filter" className="h-8 text-xs">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources.map(source => (
                        <SelectItem key={source} value={source} className="text-xs">
                          {source === 'all' ? 'All sources' : source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date-filter" className="text-xs">Date</Label>
                  <Select 
                    value={filters.dateRange || 'all_time'} 
                    onValueChange={(value) => handleFilterChange('dateRange', value === 'all_time' ? null : value)}
                  >
                    <SelectTrigger id="date-filter" className="h-8 text-xs">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_time" className="text-xs">All time</SelectItem>
                      <SelectItem value="last_7_days" className="text-xs">Last 7 days</SelectItem>
                      <SelectItem value="last_30_days" className="text-xs">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-320px)]">
          <ConversationsList 
            conversations={filteredConversations} 
            isLoading={isLoading} 
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
        
        {pagination.totalItems > 0 && (
          <div className="border-t p-4">
            <PaginationControls 
              pagination={pagination}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50">
        {selectedConversation ? (
          <ConversationDetails 
            selectedConversation={selectedConversation}
            conversationMessages={conversationMessages}
            isLoadingMessages={isLoadingMessages}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogsSection;

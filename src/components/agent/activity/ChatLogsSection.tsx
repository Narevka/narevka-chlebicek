
import React, { useState, useEffect } from "react";
import { RefreshCw, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConversationsList from "./ConversationsList";
import ConversationDetails from "./ConversationDetails";
import { Conversation, Message, PaginationState } from "./types";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const ChatLogsSection = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
  }, [user, pagination.currentPage]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get the total count for pagination
      const { count, error: countError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0
      }));
      
      // Then get the paginated data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(
          (pagination.currentPage - 1) * pagination.pageSize, 
          pagination.currentPage * pagination.pageSize - 1
        );
      
      if (conversationsError) throw conversationsError;
      
      const conversationsWithLastMessage = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select('content, is_bot')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (lastMessageError && lastMessageError.code !== 'PGRST116') {
            console.error("Error fetching last message:", lastMessageError);
            return conversation;
          }
          
          return {
            ...conversation,
            last_message: lastMessageData?.is_bot ? "AI: " + lastMessageData?.content : lastMessageData?.content
          };
        })
      );
      
      setConversations(conversationsWithLastMessage);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessagesForConversation = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setConversationMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load conversation messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessagesForConversation(conversation.id);
  };

  const filteredConversations = conversations.filter(convo => {
    const matchesSearch = convo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (convo.last_message && convo.last_message.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter ? convo.source === filter : true;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={pagination.currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat logs</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={fetchConversations}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          <ConversationsList 
            conversations={filteredConversations} 
            isLoading={isLoading} 
            onSelectConversation={handleSelectConversation}
            setConversations={setConversations}
          />
        </div>
        
        {pagination.totalItems > 0 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    aria-disabled={pagination.currentPage === 1}
                    className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    aria-disabled={pagination.currentPage === totalPages}
                    className={pagination.currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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

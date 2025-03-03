
import React, { useState, useEffect } from "react";
import { RefreshCw, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConversationsList from "./ConversationsList";
import ConversationDetails from "./ConversationDetails";
import { Conversation, Message } from "./types";

const ChatLogsSection = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
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

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Users, 
  RefreshCw, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  X,
  BarChart,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import "../ui/scrollbar.css";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  confidence?: number;
  created_at: string;
}

const SubTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  return (
    <div className="flex mb-6 space-x-2">
      <button
        className={`flex items-center px-4 py-2 rounded-md ${
          activeTab === "chatLogs"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("chatLogs")}
      >
        <MessageSquare className={`h-4 w-4 mr-2 ${activeTab === "chatLogs" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Chat Logs</span>
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-md ${
          activeTab === "leads"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("leads")}
      >
        <Users className={`h-4 w-4 mr-2 ${activeTab === "leads" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Leads</span>
      </button>
    </div>
  );
};

const ChatLogsSection = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
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

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
      
      setConversations(conversations.filter(convo => convo.id !== conversationId));
      
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
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
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <div 
                key={convo.id} 
                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectConversation(convo)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{convo.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{convo.last_message || "No messages"}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      {format(new Date(convo.updated_at), "d MMM yyyy")} ({format(new Date(convo.updated_at), "h:mm a")})
                    </span>
                    <div className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {convo.source}
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => deleteConversation(convo.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {selectedConversation && (
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex justify-between mb-4">
                <div className="bg-gray-100 text-sm px-3 py-1 rounded">
                  Source: {selectedConversation.source}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(selectedConversation.created_at), "PPP")}
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : conversationMessages.length > 0 ? (
                  conversationMessages.map((msg, i) => (
                    <div 
                      key={msg.id} 
                      className={`mb-4 flex ${msg.is_bot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.is_bot 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.confidence && msg.is_bot && (
                          <div className="mt-2 flex items-center">
                            <div className="bg-purple-500 text-xs text-white px-2 py-1 rounded flex items-center">
                              <BarChart className="h-3 w-3 mr-1" />
                              {msg.confidence.toFixed(3)}
                            </div>
                            <button className="ml-2 text-xs text-gray-500 underline">
                              Revise answer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No messages found</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const LeadsSection = () => {
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Leads</h2>
        <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Filters</h3>
        {dateFilter ? (
          <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md">
            <Calendar className="h-3 w-3 mr-2" />
            <span className="text-sm">{dateFilter}</span>
            <button className="ml-2" onClick={clearDateFilter}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md cursor-pointer">
            <Calendar className="h-3 w-3 mr-2" />
            <span className="text-sm">Select date range</span>
          </div>
        )}
      </div>

      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No leads yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Lead information captured from conversations will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState<string>("chatLogs");
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your activity.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Activity</h1>
      
      <SubTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "chatLogs" ? (
        <ChatLogsSection />
      ) : (
        <LeadsSection />
      )}
    </div>
  );
};

export default ActivityTab;

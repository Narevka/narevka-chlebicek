
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean }>>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error("Agent not found");
          navigate("/dashboard");
          return;
        }

        setAgent(data);
      } catch (error: any) {
        console.error("Error fetching agent:", error);
        toast.error(error.message || "Failed to load agent");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, user, navigate]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, { content: inputMessage, isUser: true }]);
    setSendingMessage(true);
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          content: `This is a simulated response to: "${inputMessage}"`, 
          isUser: false 
        }
      ]);
      setSendingMessage(false);
    }, 1000);
    
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([{ content: "Hi! What can I help you with?", isUser: false }]);
    toast.success("Conversation reset");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid grid-cols-5 max-w-2xl">
            <TabsTrigger value="playground" className="text-sm">Playground</TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="sources" className="text-sm">Sources</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="playground" className="mt-6">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold">Playground</h1>
              <span className="ml-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              <div className="ml-auto">
                <Button variant="outline">Compare</Button>
              </div>
            </div>

            <div className="border rounded-lg bg-dot-pattern min-h-[600px] relative">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-white rounded-t-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 9h6" />
                        <path d="M9 15h6" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium">{agent?.name || "Agent"}</h3>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex items-center">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message..."
                      className="flex-1"
                      disabled={sendingMessage}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !inputMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-400">
                    Powered By Lovable.dev
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">Activity Log</h3>
              <p className="text-muted-foreground">View all conversations with this agent.</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium">Analytics</h3>
              <p className="text-muted-foreground">Analytics information will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="sources">
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium">Sources</h3>
              <p className="text-muted-foreground">Configure knowledge sources for your agent.</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium">Settings</h3>
              <p className="text-muted-foreground">Configure your agent settings here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDetail;

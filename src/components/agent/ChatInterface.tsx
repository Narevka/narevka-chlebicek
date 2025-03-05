
import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id?: string;
  content: string;
  isUser: boolean;
  confidence?: number;
  created_at?: string;
}

interface ChatInterfaceProps {
  agentName: string;
  agentId?: string;
}

const ChatInterface = ({ agentName, agentId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Array<Message>>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [threadId, setThreadId] = React.useState<string | null>(null);

  useEffect(() => {
    // Create a new conversation when component mounts
    const createConversation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: "New conversation",
            source: "Playground"
          })
          .select('id')
          .single();

        if (error) throw error;
        
        setConversationId(data.id);
        
        // Save initial bot message
        await saveMessageToDb({
          conversation_id: data.id,
          content: "Hi! What can I help you with?",
          is_bot: true
        });
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    };

    createConversation();
  }, [user]);

  const saveMessageToDb = async (messageData: {
    conversation_id: string;
    content: string;
    is_bot: boolean;
    confidence?: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save message");
    }
  };

  const updateConversationTitle = async (newTitle: string) => {
    if (!conversationId || !user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || !agentId) return;
    
    const userMessage = {
      id: uuidv4(),
      content: inputMessage,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    
    // Save user message to database
    await saveMessageToDb({
      conversation_id: conversationId,
      content: inputMessage,
      is_bot: false
    });
    
    try {
      // Call our edge function to get a response from the assistant
      const responseData = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message: inputMessage,
          agentId: agentId,
          conversationId: threadId
        }
      });
      
      if (responseData.error) {
        throw new Error(responseData.error.message || "Failed to get assistant response");
      }
      
      // Update thread ID if it's a new conversation
      if (responseData.data.threadId && !threadId) {
        setThreadId(responseData.data.threadId);
      }
      
      const botResponse = { 
        id: uuidv4(),
        content: responseData.data.response || "I'm sorry, I couldn't generate a response.", 
        isUser: false,
        confidence: responseData.data.confidence || 0.75
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence
      });
      
      // Update conversation title with the first user message if it's the second message in the conversation
      if (messages.length === 1) {
        updateConversationTitle(inputMessage);
      }
    } catch (error: any) {
      console.error("Error getting assistant response:", error);
      toast.error(error.message || "Failed to get assistant response");
      
      // Add error message
      const errorMessage = { 
        id: uuidv4(),
        content: "Sorry, I encountered an error processing your request. Please try again.", 
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: errorMessage.content,
        is_bot: true
      });
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleReset = async () => {
    if (!user) return;

    // Create a new conversation
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: "New conversation",
          source: "Playground"
        })
        .select('id')
        .single();

      if (error) throw error;
      
      setConversationId(data.id);
      setThreadId(null); // Reset OpenAI thread ID
      setMessages([{ content: "Hi! What can I help you with?", isUser: false }]);
      
      // Save initial bot message
      await saveMessageToDb({
        conversation_id: data.id,
        content: "Hi! What can I help you with?",
        is_bot: true
      });
      
      toast.success("Conversation reset");
    } catch (error) {
      console.error("Error resetting conversation:", error);
      toast.error("Failed to reset conversation");
    }
  };

  return (
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
            <h3 className="text-md font-medium">{agentName}</h3>
          </div>
          <div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <MessageList messages={messages} />
        
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          sendingMessage={sendingMessage}
        />
      </div>
    </div>
  );
};

export default ChatInterface;


import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id?: string;
  content: string;
  isUser: boolean;
  confidence?: number;
  created_at?: string;
}

export const useConversation = (userId: string | undefined, agentId: string | undefined) => {
  const [messages, setMessages] = useState<Array<Message>>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    // Create a new conversation when component mounts
    const createConversation = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
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
  }, [userId]);

  const saveMessageToDb = async (messageData: {
    conversation_id: string;
    content: string;
    is_bot: boolean;
    confidence?: number;
  }) => {
    if (!userId) return;

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
    if (!conversationId || !userId) return;

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !conversationId || !agentId) return;
    
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    
    // Save user message to database
    await saveMessageToDb({
      conversation_id: conversationId,
      content: message,
      is_bot: false
    });
    
    try {
      // Call our edge function to get a response from the assistant
      const responseData = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message: message,
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
        updateConversationTitle(message);
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

  const resetConversation = async () => {
    if (!userId) return;

    // Create a new conversation
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
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

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation
  };
};

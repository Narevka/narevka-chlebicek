
import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useAuth } from "@/context/AuthContext";
import { useConversation } from "@/hooks/useConversation";

interface ChatInterfaceProps {
  agentName: string;
  agentId?: string;
  source?: string;
}

const ChatInterface = ({ agentName, agentId, source = "Playground" }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation,
    isInitializing
  } = useConversation(user?.id, agentId, source);

  // Persist conversation source identifier and ensure accurate source labeling
  useEffect(() => {
    // Force certain source strings to standard values to prevent inconsistencies
    let normalizedSource = source;
    
    // Standardize source names to prevent multiple variants
    if (source.toLowerCase().includes("playground")) {
      normalizedSource = "Playground";
    } else if (source.toLowerCase().includes("embed")) {
      normalizedSource = "embedded";
    }
    
    // Store this normalized source in sessionStorage for consistency
    sessionStorage.setItem('current_chat_source', normalizedSource);
    
    console.log(`ChatInterface initialized with normalized source: ${normalizedSource}`);
    
    // Force update any existing conversation's source if it's wrong
    const existingConvoId = sessionStorage.getItem(`current_conversation_${normalizedSource}`);
    if (existingConvoId) {
      const currentSourceLabel = sessionStorage.getItem('source_label_for_' + existingConvoId);
      if (currentSourceLabel !== normalizedSource) {
        console.log(`Correcting source label for conversation ${existingConvoId} from ${currentSourceLabel} to ${normalizedSource}`);
        sessionStorage.setItem('source_label_for_' + existingConvoId, normalizedSource);
      }
    }
  }, [source]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && inputMessage.trim() !== '') {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  const handleSendButtonClick = () => {
    if (inputMessage.trim() !== '') {
      handleSendMessage(inputMessage);
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
            <Button variant="ghost" size="icon" onClick={resetConversation}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <MessageList messages={messages} />
        
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendButtonClick}
          handleKeyDown={handleKeyDown}
          sendingMessage={sendingMessage}
        />
      </div>
    </div>
  );
};

export default ChatInterface;


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
  
  // Validate source - ensure it's a string and not empty
  const validSource = typeof source === 'string' && source.trim() !== '' 
    ? source.trim() 
    : "Playground";
  
  // Log the source for debugging purposes
  console.log(`ChatInterface: Using conversation source: "${validSource}"`);
  
  const {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation
  } = useConversation(user?.id, agentId, validSource);

  // Effect to log when source changes
  useEffect(() => {
    console.log(`ChatInterface: Source parameter changed to "${validSource}"`);
  }, [validSource]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
            {validSource && validSource !== "Playground" && (
              <div className="text-xs text-gray-500 text-center">Source: {validSource}</div>
            )}
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
          handleSendMessage={() => handleSendMessage(inputMessage)}
          handleKeyDown={handleKeyDown}
          sendingMessage={sendingMessage}
        />
      </div>
    </div>
  );
};

export default ChatInterface;

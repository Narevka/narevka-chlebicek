
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface Message {
  content: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  agentName: string;
}

const ChatInterface = ({ agentName }: ChatInterfaceProps) => {
  const [messages, setMessages] = React.useState<Array<Message>>([
    { content: "Hi! What can I help you with?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);

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

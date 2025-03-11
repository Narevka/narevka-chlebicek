
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendingMessage: boolean;
}

const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyDown,
  sendingMessage,
}: ChatInputProps) => {
  return (
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
          disabled={sendingMessage || inputMessage.trim() === ''}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-center mt-2 text-xs text-gray-400">
        Powered By Lovable.dev
      </div>
    </div>
  );
};

export default ChatInput;

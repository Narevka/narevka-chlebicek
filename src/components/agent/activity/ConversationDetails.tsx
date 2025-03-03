
import React from "react";
import { format } from "date-fns";
import { Loader2, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Message, Conversation } from "./types";

interface ConversationDetailsProps {
  selectedConversation: Conversation | null;
  conversationMessages: Message[];
  isLoadingMessages: boolean;
  onClose: () => void;
}

const ConversationDetails = ({ 
  selectedConversation, 
  conversationMessages, 
  isLoadingMessages,
  onClose
}: ConversationDetailsProps) => {
  if (!selectedConversation) return null;

  return (
    <Dialog open={!!selectedConversation} onOpenChange={() => onClose()}>
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
              conversationMessages.map((msg) => (
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
  );
};

export default ConversationDetails;

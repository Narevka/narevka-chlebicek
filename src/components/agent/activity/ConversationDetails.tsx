
import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2, BarChart, Edit, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message, Conversation } from "./types";
import { toast } from "sonner";

interface ConversationDetailsProps {
  selectedConversation: Conversation;
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
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [revisedAnswer, setRevisedAnswer] = useState("");

  const handleReviseClick = (message: Message) => {
    setSelectedMessage(message);
    setRevisedAnswer(message.content);
    setReviseDialogOpen(true);
  };

  const submitRevisedAnswer = () => {
    toast.success("Answer revised successfully and added to Q&A sources");
    setReviseDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            Source: {selectedConversation.source}
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(selectedConversation.created_at), "PPP")}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : conversationMessages.length > 0 ? (
          <div className="space-y-6">
            {conversationMessages.map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`flex ${!msg.is_bot ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] p-4 rounded-lg ${
                    !msg.is_bot 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-50 text-gray-800'
                  }`}
                >
                  <p className="text-base leading-relaxed">{msg.content}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {msg.created_at && format(new Date(msg.created_at), "d MMM yyyy, h:mm a")}
                  </div>
                  {msg.confidence !== null && msg.confidence !== undefined && msg.is_bot && (
                    <div className="mt-3 flex items-center space-x-3">
                      <div className="bg-purple-500 text-xs text-white px-2 py-1 rounded-full flex items-center">
                        <BarChart className="h-3 w-3 mr-1" />
                        {msg.confidence.toFixed(3)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-gray-500 hover:text-purple-700"
                        onClick={() => handleReviseClick(msg)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Revise answer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages found</p>
          </div>
        )}
      </div>

      {/* Revise Answer Dialog */}
      <Dialog open={reviseDialogOpen} onOpenChange={setReviseDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Revise Answer</DialogTitle>
            <DialogDescription>
              Modify the answer provided by the AI Agent to improve accuracy.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">User Question</label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {conversationMessages.find(msg => !msg.is_bot && 
                  conversationMessages.indexOf(msg) < 
                  conversationMessages.indexOf(selectedMessage as Message))?.content || "No question found"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current AI Answer</label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {selectedMessage?.content}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Expected Response</label>
              <Textarea 
                value={revisedAnswer} 
                onChange={(e) => setRevisedAnswer(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setReviseDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitRevisedAnswer}>Save Revised Answer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationDetails;

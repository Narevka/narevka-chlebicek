import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2, BarChart, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <div className="h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-100 text-sm px-3 py-1 rounded">
          Source: {selectedConversation.source}
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(selectedConversation.created_at), "PPP")}
        </div>
      </div>

      <div className="border rounded-lg bg-white p-4 h-[calc(100vh-200px)] overflow-y-auto">
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
                      Confidence: {msg.confidence.toFixed(3)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 text-xs text-gray-500 hover:text-purple-700"
                      onClick={() => handleReviseClick(msg)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Revise answer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages found</p>
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

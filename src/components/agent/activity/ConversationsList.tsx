
import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Conversation } from "./types";

interface ConversationsListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string, e: React.MouseEvent) => void;
}

const ConversationsList = ({ 
  conversations, 
  isLoading, 
  onSelectConversation, 
  onDeleteConversation 
}: ConversationsListProps) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No conversations found</p>
      </div>
    );
  }

  return (
    <>
      {conversations.map((convo) => (
        <div 
          key={convo.id} 
          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelectConversation(convo)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{convo.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{convo.last_message || "No messages"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                {format(new Date(convo.updated_at), "d MMM yyyy")} ({format(new Date(convo.updated_at), "h:mm a")})
              </span>
              <div className="bg-gray-100 text-xs px-2 py-1 rounded">
                {convo.source}
              </div>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={(e) => onDeleteConversation(convo.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ConversationsList;

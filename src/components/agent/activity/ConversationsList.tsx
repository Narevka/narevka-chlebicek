
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
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900 mr-3">
                {convo.title && convo.title !== "New conversation" 
                  ? convo.title 
                  : convo.user_message 
                    ? convo.user_message.substring(0, 40) + (convo.user_message.length > 40 ? '...' : '')
                    : "New conversation"}
              </h3>
              <div className="bg-gray-100 text-xs px-2 py-1 rounded">
                {convo.source}
              </div>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {format(new Date(convo.updated_at), "d MMM yyyy")} ({format(new Date(convo.updated_at), "h:mm a")})
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{convo.last_message || "No messages"}</p>
          
          <div className="flex justify-end mt-2">
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={(e) => onDeleteConversation(convo.id, e)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ConversationsList;

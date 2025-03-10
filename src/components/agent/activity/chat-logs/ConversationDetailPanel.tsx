
import React from "react";
import { Conversation, Message } from "../types";
import ConversationDetails from "../ConversationDetails";

interface ConversationDetailPanelProps {
  selectedConversation: Conversation | null;
  conversationMessages: Message[];
  isLoadingMessages: boolean;
  onClose: () => void;
}

const ConversationDetailPanel: React.FC<ConversationDetailPanelProps> = ({
  selectedConversation,
  conversationMessages,
  isLoadingMessages,
  onClose,
}) => {
  return (
    <div className="flex-1 bg-gray-50">
      {selectedConversation ? (
        <ConversationDetails 
          selectedConversation={selectedConversation}
          conversationMessages={conversationMessages}
          isLoadingMessages={isLoadingMessages}
          onClose={onClose}
        />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          Select a conversation to view details
        </div>
      )}
    </div>
  );
};

export default ConversationDetailPanel;


import React from "react";
import { useChatLogs } from "./chat-logs/useChatLogs";
import ConversationListPanel from "./chat-logs/ConversationListPanel";
import ConversationDetailPanel from "./chat-logs/ConversationDetailPanel";

interface ChatLogsSectionProps {
  agentId?: string;
}

const ChatLogsSection = ({ agentId }: ChatLogsSectionProps) => {
  const {
    conversations,
    selectedConversation,
    conversationMessages,
    searchTerm,
    setSearchTerm,
    filters,
    isLoading,
    isLoadingMessages,
    pagination,
    totalPages,
    showFilterPanel,
    availableSources,
    handleSelectConversation,
    handleDeleteConversation,
    handlePageChange,
    handleFilterChange,
    handleToggleFilterPanel,
    handleExport,
    loadConversations,
    setSelectedConversation
  } = useChatLogs(agentId);

  return (
    <div className="flex h-full">
      <ConversationListPanel
        conversations={conversations}
        filteredConversations={conversations}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        pagination={pagination}
        totalPages={totalPages}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onPageChange={handlePageChange}
        onRefresh={loadConversations}
        filters={filters}
        showFilterPanel={showFilterPanel}
        availableSources={availableSources}
        onFilterChange={handleFilterChange}
        onToggleFilterPanel={handleToggleFilterPanel}
        onExport={handleExport}
      />

      <ConversationDetailPanel
        selectedConversation={selectedConversation}
        conversationMessages={conversationMessages}
        isLoadingMessages={isLoadingMessages}
        onClose={() => setSelectedConversation(null)}
      />
    </div>
  );
};

export default ChatLogsSection;

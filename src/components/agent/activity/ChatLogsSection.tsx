
import React from "react";
import { useChatLogs } from "./chat-logs/useChatLogs";
import ConversationListPanel from "./chat-logs/ConversationListPanel";
import ConversationDetailPanel from "./chat-logs/ConversationDetailPanel";

const ChatLogsSection = () => {
  const {
    filteredConversations,
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
  } = useChatLogs();

  return (
    <div className="flex h-full">
      <ConversationListPanel
        conversations={[]} // Not needed, using filteredConversations instead
        filteredConversations={filteredConversations}
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

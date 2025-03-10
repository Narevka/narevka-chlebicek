
import React from "react";
import { Conversation, PaginationState } from "../types";
import SearchBar from "../SearchBar";
import ConversationsList from "../ConversationsList";
import PaginationControls from "../PaginationControls";
import HeaderActions from "./HeaderActions";

interface ConversationListPanelProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  pagination: PaginationState;
  totalPages: number;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string, e: React.MouseEvent) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  filters: any;
  showFilterPanel: boolean;
  availableSources: string[];
  onFilterChange: (filterType: any, value: string | null) => void;
  onToggleFilterPanel: () => void;
  onExport: (format: string) => void;
}

const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  filteredConversations,
  searchTerm,
  setSearchTerm,
  isLoading,
  pagination,
  totalPages,
  onSelectConversation,
  onDeleteConversation,
  onPageChange,
  onRefresh,
  filters,
  showFilterPanel,
  availableSources,
  onFilterChange,
  onToggleFilterPanel,
  onExport,
}) => {
  return (
    <div className="w-[400px] border-r">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Chat logs</h2>
          <HeaderActions
            onRefresh={onRefresh}
            filters={filters}
            showFilterPanel={showFilterPanel}
            availableSources={availableSources}
            onFilterChange={onFilterChange}
            onToggleFilterPanel={onToggleFilterPanel}
            onExport={onExport}
          />
        </div>

        <div className="mb-4">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-320px)]">
        <ConversationsList 
          conversations={filteredConversations} 
          isLoading={isLoading} 
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </div>
      
      {pagination.totalItems > 0 && (
        <div className="border-t p-4">
          <PaginationControls 
            pagination={pagination}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ConversationListPanel;

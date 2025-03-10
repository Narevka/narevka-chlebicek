
import { WebsiteSourceItem } from "../WebsiteItem";
import { useDeleteActions } from "./useDeleteActions";
import { useDownloadActions } from "./useDownloadActions";
import { useProcessActions } from "./useProcessActions";

interface UseSourceActionsProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  deletedSourceIds: Set<string>;
  setDeletedSourceIds: (ids: Set<string>) => void;
  localStorageKey: string;
  deletedSourcesKey: string;
  agentId?: string;
}

export const useSourceActions = ({
  includedLinks,
  setIncludedLinks,
  deletedSourceIds,
  setDeletedSourceIds,
  localStorageKey,
  deletedSourcesKey,
  agentId
}: UseSourceActionsProps) => {
  // Delete actions
  const { 
    handleDeleteLink, 
    handleDeleteAllLinks 
  } = useDeleteActions({
    includedLinks,
    setIncludedLinks,
    deletedSourceIds,
    setDeletedSourceIds,
    localStorageKey,
    deletedSourcesKey
  });

  // Download actions
  const { 
    downloadingId, 
    handleDownloadContent 
  } = useDownloadActions();

  // Process actions
  const { 
    handleProcessSource 
  } = useProcessActions({
    includedLinks,
    setIncludedLinks,
    localStorageKey,
    agentId
  });

  return {
    downloadingId,
    handleDeleteLink,
    handleDeleteAllLinks,
    handleDownloadContent,
    handleProcessSource
  };
};


import { WebsiteSourceItem } from "../WebsiteItem";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseProcessActionsProps {
  includedLinks: WebsiteSourceItem[];
  setIncludedLinks: (links: WebsiteSourceItem[]) => void;
  localStorageKey: string;
  agentId?: string;
}

export const useProcessActions = ({
  includedLinks,
  setIncludedLinks,
  localStorageKey,
  agentId
}: UseProcessActionsProps) => {
  const handleProcessSource = async (sourceId: string, index: number) => {
    if (!sourceId || !agentId) {
      toast.error("Missing source ID or agent ID");
      return;
    }

    // Update state to show processing
    const newLinks = [...includedLinks];
    newLinks[index] = {...newLinks[index], isProcessing: true};
    setIncludedLinks(newLinks);
    
    // Update local storage
    localStorage.setItem(localStorageKey, JSON.stringify(newLinks));
    
    try {
      // Process the source using the process-agent-source function
      const { data: processResponse, error: processError } = await supabase.functions.invoke('process-agent-source', {
        body: { 
          sourceId, 
          agentId,
          operation: 'add'
        }
      });
      
      if (processError) {
        throw new Error(processError.message || "Failed to process source");
      }
      
      toast.success("Website content processed successfully");
      
      // Update state to show processing complete
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
      
      // Update local storage
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
    } catch (error: any) {
      console.error("Error processing source:", error);
      toast.error(`Failed to process source: ${error.message}`);
      
      // Update state to show processing failed
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
      
      // Update local storage
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLinks));
    }
  };

  return {
    handleProcessSource
  };
};

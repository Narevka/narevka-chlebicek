
import { supabase } from "@/integrations/supabase/client";
import { SourceItem } from "@/types/sources";
import { toast } from "sonner";
import { processSourceWithOpenAI, readFileAsBase64 } from "../sourceProcessingService";

export const addFileSource = async (
  agentId: string, 
  userId: string, 
  files: File[], 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    for (const file of files) {
      const fileBase64 = await readFileAsBase64(file);
      
      const { data, error } = await supabase
        .from("agent_sources")
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: "file",
          content: file.name,
          chars: Math.floor(file.size / 4)
        }])
        .select();
        
      if (error) throw error;
      
      if (data) {
        const newSources = data as SourceItem[];
        setSourcesCallback([...newSources, ...sources]);
        
        try {
          const sourceId = newSources[0].id;
          await processSourceWithOpenAI(sourceId, agentId, fileBase64);
          toast.success(`${file.name} added and processed successfully`);
        } catch (processError: any) {
          console.error(`Error processing file ${file.name} with OpenAI:`, processError);
          toast.warning(`${file.name} added to database but failed to process with OpenAI: ${processError.message}`);
        }
      }
    }
  } catch (error: any) {
    console.error("Error adding files:", error);
    toast.error(`Failed to add files: ${error.message}`);
  }
};


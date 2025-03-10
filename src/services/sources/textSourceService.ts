
import { supabase } from "@/integrations/supabase/client";
import { SourceItem } from "@/types/sources";
import { toast } from "sonner";
import { processSourceWithOpenAI } from "../sourceProcessingService";

export const addTextSource = async (
  agentId: string, 
  userId: string, 
  text: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    const chars = text.length;
    
    const { data, error } = await supabase
      .from("agent_sources")
      .insert([{
        agent_id: agentId,
        user_id: userId,
        type: "text",
        content: text,
        chars: chars
      }])
      .select();
      
    if (error) throw error;
    
    if (data) {
      const newSources = data as SourceItem[];
      setSourcesCallback([...newSources, ...sources]);
      
      try {
        const sourceId = newSources[0].id;
        await processSourceWithOpenAI(sourceId, agentId);
        toast.success("Text added and processed successfully");
      } catch (processError: any) {
        console.error("Error processing text with OpenAI:", processError);
        toast.warning("Text added to database but failed to process with OpenAI");
      }
    }
  } catch (error) {
    console.error("Error adding text:", error);
    toast.error("Failed to add text");
  }
};


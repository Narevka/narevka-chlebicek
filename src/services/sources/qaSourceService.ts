
import { supabase } from "@/integrations/supabase/client";
import { SourceItem } from "@/types/sources";
import { toast } from "sonner";
import { processSourceWithOpenAI } from "../sourceProcessingService";

export const addQASource = async (
  agentId: string, 
  userId: string, 
  question: string, 
  answer: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    const content = JSON.stringify({ question, answer });
    const chars = question.length + answer.length;
    
    const { data, error } = await supabase
      .from("agent_sources")
      .insert([{
        agent_id: agentId,
        user_id: userId,
        type: "qa",
        content: content,
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
        toast.success("Q&A added and processed successfully");
      } catch (processError: any) {
        console.error("Error processing Q&A with OpenAI:", processError);
        toast.warning("Q&A added to database but failed to process with OpenAI");
      }
    }
  } catch (error) {
    console.error("Error adding Q&A:", error);
    toast.error("Failed to add Q&A");
  }
};



import { supabase } from "@/integrations/supabase/client";
import { SourceItem, SourceStats } from "@/types/sources";
import { toast } from "sonner";
import { processSourceWithOpenAI, readFileAsBase64 } from "./sourceProcessingService";

/**
 * Fetch all sources for an agent
 */
export const fetchAgentSources = async (agentId: string): Promise<SourceItem[]> => {
  if (!agentId) return [];
  
  try {
    const { data, error } = await supabase
      .from("agent_sources")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching sources:", error);
    toast.error("Failed to load sources");
    return [];
  }
};

/**
 * Add a text source to an agent
 */
export const addTextSource = async (
  agentId: string, 
  userId: string, 
  text: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    // Estimate character count
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
      
      // Process the new source with OpenAI
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

/**
 * Add file sources to an agent
 */
export const addFileSource = async (
  agentId: string, 
  userId: string, 
  files: File[], 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    for (const file of files) {
      // First, read the file as base64
      const fileBase64 = await readFileAsBase64(file);
      
      const { data, error } = await supabase
        .from("agent_sources")
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: "file",
          content: file.name,
          chars: Math.floor(file.size / 4) // Rough estimate of character count
        }])
        .select();
        
      if (error) throw error;
      
      if (data) {
        const newSources = data as SourceItem[];
        setSourcesCallback([...newSources, ...sources]);
        
        // Process the new source with OpenAI, passing the file content
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

/**
 * Add a Q&A source to an agent
 */
export const addQASource = async (
  agentId: string, 
  userId: string, 
  question: string, 
  answer: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
) => {
  try {
    // Create content for Q&A with a clear formatting for later parsing
    const content = JSON.stringify({ question, answer });
    // Estimate character count
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
      
      // Process the new source with OpenAI
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

/**
 * Add a website source to an agent
 */
export const addWebsiteSource = async (
  agentId: string, 
  userId: string, 
  url: string, 
  sources: SourceItem[],
  setSourcesCallback: (sources: SourceItem[]) => void
): Promise<string> => {
  try {
    // Call edge function to crawl the website
    const { data: crawlResponse, error: crawlError } = await supabase.functions.invoke('crawl-website', {
      body: { 
        url,
        agentId,
        userId,
        limit: 5 // Default limit of 5 pages
      }
    });
    
    if (crawlError) {
      console.error("Crawl error:", crawlError);
      throw new Error(crawlError.message || "Failed to crawl website");
    }
    
    if (!crawlResponse.success) {
      console.error("Crawl response error:", crawlResponse.error);
      throw new Error(crawlResponse.error || "Failed to crawl website");
    }
    
    // Refresh sources list after crawling
    const refreshedSources = await fetchAgentSources(agentId);
    setSourcesCallback(refreshedSources);
    
    // Get the source ID from the response
    const sourceId = crawlResponse.sourceId;
    
    if (!sourceId) {
      throw new Error("Failed to get source ID from crawl response");
    }
    
    toast.success("Website crawled successfully. You can process it with OpenAI using the process button.");
    
    return sourceId;
  } catch (error: any) {
    console.error("Error adding website:", error);
    toast.error(`Failed to add website: ${error.message}`);
    throw error; // Re-throw the error so it can be caught by the component
  }
};

/**
 * Calculate source statistics
 */
export const calculateSourceStats = (sources: SourceItem[]): SourceStats => {
  const filesSources = sources.filter(s => s.type === "file");
  const textSources = sources.filter(s => s.type === "text");
  const websiteSources = sources.filter(s => s.type === "website");
  const qaSources = sources.filter(s => s.type === "qa");
  
  const fileChars = filesSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const textChars = textSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const websiteChars = websiteSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const qaChars = qaSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const totalChars = fileChars + textChars + websiteChars + qaChars;

  return {
    filesSources,
    textSources,
    websiteSources,
    qaSources,
    fileChars,
    textChars,
    websiteChars,
    qaChars,
    totalChars
  };
};

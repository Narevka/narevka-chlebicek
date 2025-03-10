
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentSettings {
  name: string;
  description: string;
  instructions: string;
  isPublic: boolean;
  openaiAssistantId: string | null;
}

export const useAgentSettings = (agentId: string, userId: string | undefined) => {
  const [settings, setSettings] = useState<AgentSettings>({
    name: "",
    description: "",
    instructions: "",
    isPublic: false,
    openaiAssistantId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAgentSettings = async () => {
      if (!agentId || !userId) return;
      
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("name, description, instructions, openai_assistant_id, is_public")
          .eq("id", agentId)
          .eq("user_id", userId)
          .single();
          
        if (error) throw error;
        
        setSettings({
          name: data?.name || "",
          description: data?.description || "",
          instructions: data?.instructions || "",
          isPublic: data?.is_public || false,
          openaiAssistantId: data?.openai_assistant_id,
        });
      } catch (error: any) {
        console.error("Error fetching agent settings:", error);
        toast.error("Failed to load agent settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentSettings();
  }, [agentId, userId]);

  const handleSave = async () => {
    if (!agentId || !userId) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("agents")
        .update({
          name: settings.name,
          description: settings.description,
          instructions: settings.instructions,
          is_public: settings.isPublic
        })
        .eq("id", agentId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      if (settings.openaiAssistantId) {
        const updateAssistantResponse = await supabase.functions.invoke('update-openai-assistant', {
          body: { 
            assistantId: settings.openaiAssistantId,
            name: settings.name,
            description: settings.description,
            instructions: settings.instructions
          }
        });
        
        if (updateAssistantResponse.error) {
          console.error("Error updating OpenAI assistant:", updateAssistantResponse.error);
          toast.warning("Agent settings saved but OpenAI Assistant update failed");
          return;
        }
      }
      
      toast.success("Agent settings saved successfully");
    } catch (error: any) {
      console.error("Error saving agent settings:", error);
      toast.error(error.message || "Failed to save agent settings");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    isLoading,
    isSaving,
    handleSave,
  };
};

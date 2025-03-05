
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const SettingsTab = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [openaiAssistantId, setOpenaiAssistantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchAgentSettings = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("name, description, instructions, openai_assistant_id")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
          
        if (error) {
          console.error("Database error:", error);
          throw error;
        }
        
        // Now that we've checked for errors, we can safely access the data
        setName(data?.name || "");
        setDescription(data?.description || "");
        setInstructions(data?.instructions || "");
        setOpenaiAssistantId(data?.openai_assistant_id);
      } catch (error) {
        console.error("Error fetching agent settings:", error);
        toast.error("Failed to load agent settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentSettings();
  }, [id, user]);
  
  const handleSave = async () => {
    if (!id || !user) return;
    
    setIsSaving(true);
    
    try {
      // Update agent in database
      const { error } = await supabase
        .from("agents")
        .update({
          name,
          description,
          instructions
        })
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // If there's an OpenAI Assistant ID, update the assistant
      if (openaiAssistantId) {
        const updateAssistantResponse = await supabase.functions.invoke('update-openai-assistant', {
          body: { 
            assistantId: openaiAssistantId,
            name,
            description,
            instructions
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
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-medium mb-6">Agent Settings</h3>
      
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Agent Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My AI Assistant"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A helpful assistant for my website"
          />
          <p className="text-xs text-gray-500">
            A brief description of your agent's purpose.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-medium">
            Instructions
          </label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="You are a helpful AI assistant. Answer questions accurately and concisely."
            rows={6}
          />
          <p className="text-xs text-gray-500">
            Detailed instructions that guide how your agent behaves and responds to users.
            Good instructions lead to better, more consistent responses.
          </p>
        </div>
        
        {openaiAssistantId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              OpenAI Assistant ID
            </label>
            <p className="p-2 bg-gray-50 border rounded text-sm text-gray-700 font-mono">
              {openaiAssistantId}
            </p>
            <p className="text-xs text-gray-500">
              This is your agent's OpenAI Assistant ID. It's automatically managed by the system.
            </p>
          </div>
        )}
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="mt-4"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;

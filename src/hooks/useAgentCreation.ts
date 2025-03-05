
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAgentCreation = (
  userId: string | undefined,
  onAgentCreated: () => void,
  onClose: () => void
) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create an agent");
      return;
    }

    setIsSubmitting(true);
    setDebugInfo(null);
    setRawResponse(null);

    try {
      // Create agent in database
      const { data, error } = await supabase
        .from("agents")
        .insert([
          { 
            user_id: userId,
            name: name.trim(),
            description: description.trim() || null,
            instructions: instructions.trim() || null,
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to create agent");
      }

      const agentData = data[0];
      setDebugInfo(`Agent created in database with ID: ${agentData.id}`);

      // Call edge function to create OpenAI Assistant
      setDebugInfo(prev => `${prev}\nCalling edge function to create OpenAI Assistant...`);
      const createAssistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: { agentData }
      });

      setDebugInfo(prev => `${prev}\nEdge function response received: ${JSON.stringify(createAssistantResponse)}`);

      if (createAssistantResponse.error) {
        console.error("Error creating OpenAI assistant:", createAssistantResponse.error);
        setDebugInfo(prev => `${prev}\nError from edge function: ${createAssistantResponse.error}`);
        setRawResponse(JSON.stringify(createAssistantResponse, null, 2));
        toast.warning("Agent created but OpenAI Assistant creation failed. It will be retried later.");
      } else {
        const responseData = createAssistantResponse.data;
        setDebugInfo(prev => `${prev}\nSuccess response: ${JSON.stringify(responseData)}`);
        setRawResponse(JSON.stringify(responseData, null, 2));
        
        if (responseData.success) {
          setDebugInfo(prev => `${prev}\nOpenAI Assistant created successfully with ID: ${responseData.assistant?.id}`);
          toast.success("Agent created successfully with OpenAI Assistant");
        } else {
          setDebugInfo(prev => `${prev}\nError message from OpenAI: ${responseData.error}`);
          toast.warning(`Agent created but OpenAI Assistant creation failed: ${responseData.error}`);
        }
      }

      onAgentCreated();
      // Don't close the modal immediately so user can see debug info if there's an error
      if (!createAssistantResponse.error) {
        onClose();
      }
      
      // Reset form
      setName("");
      setDescription("");
      setInstructions("");
    } catch (error: any) {
      console.error("Error creating agent:", error);
      setDebugInfo(prev => `${prev}\nError creating agent: ${error.message}`);
      setRawResponse(JSON.stringify(error, null, 2));
      toast.error(error.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    instructions,
    setInstructions,
    isSubmitting,
    debugInfo,
    rawResponse,
    handleSubmit
  };
};

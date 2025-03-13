
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CreationStep = 'idle' | 'creating_agent' | 'creating_assistant';

export interface AgentFormData {
  name: string;
  description: string;
  instructions: string;
  isPublic: boolean;
}

export interface UseAgentCreationProps {
  userId: string | undefined;
  onAgentCreated: () => void;
  onClose: () => void;
}

export const useAgentCreation = ({ userId, onAgentCreated, onClose }: UseAgentCreationProps) => {
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    instructions: "",
    isPublic: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationStep, setCreationStep] = useState<CreationStep>('idle');

  const updateFormField = (field: keyof AgentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create an agent");
      return;
    }

    setIsSubmitting(true);
    setCreationStep('creating_agent');

    try {
      // Create agent in database
      const { data, error } = await supabase
        .from("agents")
        .insert([
          { 
            user_id: userId,
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            instructions: formData.instructions.trim() || null,
            is_public: formData.isPublic,
            is_active: true
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
      console.log("Agent created successfully:", agentData);

      // Call edge function to create OpenAI Assistant
      setCreationStep('creating_assistant');
      const createAssistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: { agentData }
      });

      if (createAssistantResponse.error) {
        console.error("Error creating OpenAI assistant:", createAssistantResponse.error);
        toast.warning("Agent created but OpenAI Assistant creation failed. It will be retried later.");
      } else {
        const assistantData = createAssistantResponse.data.assistant;
        console.log("OpenAI Assistant created successfully:", assistantData);
        toast.success("Agent created successfully with OpenAI Assistant");
      }

      onAgentCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        instructions: "",
        isPublic: true
      });
      setCreationStep('idle');
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
      setCreationStep('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmitButtonText = () => {
    if (creationStep === 'creating_agent') {
      return "Creating agent...";
    } else if (creationStep === 'creating_assistant') {
      return "Setting up OpenAI assistant...";
    } else {
      return "Create Agent";
    }
  };

  return {
    formData,
    updateFormField,
    isSubmitting,
    creationStep,
    handleSubmit,
    renderSubmitButtonText
  };
};

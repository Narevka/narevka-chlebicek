
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

export interface AgentFormErrors {
  name?: string;
  description?: string;
  instructions?: string;
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
  const [formErrors, setFormErrors] = useState<AgentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationStep, setCreationStep] = useState<CreationStep>('idle');

  const updateFormField = (field: keyof AgentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user updates the field
    if (formErrors[field as keyof AgentFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: AgentFormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Agent name is required";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
      isValid = false;
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
      isValid = false;
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = "Description must be less than 200 characters";
      isValid = false;
    }

    if (formData.instructions && formData.instructions.length > 1000) {
      errors.instructions = "Instructions must be less than 1000 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
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
      setFormErrors({});
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
    formErrors,
    updateFormField,
    isSubmitting,
    creationStep,
    handleSubmit,
    renderSubmitButtonText
  };
};

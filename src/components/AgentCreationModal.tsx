
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AgentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
}

const AgentCreationModal: React.FC<AgentCreationModalProps> = ({ 
  isOpen, 
  onClose,
  onAgentCreated
}) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create an agent");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create agent in database
      const { data, error } = await supabase
        .from("agents")
        .insert([
          { 
            user_id: user.id,
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

      // Call edge function to create OpenAI Assistant
      const createAssistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: { agentData }
      });

      if (createAssistantResponse.error) {
        console.error("Error creating OpenAI assistant:", createAssistantResponse.error);
        toast.warning("Agent created but OpenAI Assistant creation failed. It will be retried later.");
      } else {
        toast.success("Agent created successfully with OpenAI Assistant");
      }

      onAgentCreated();
      onClose();
      
      // Reset form
      setName("");
      setDescription("");
      setInstructions("");
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[525px] bg-white border-gray-200 shadow-lg"
        style={{ opacity: 1 }}
      >
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Create a new chatbot agent to embed on your website. This will also create an OpenAI Assistant.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My AI Assistant"
                required
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A helpful assistant for my website"
                className="bg-gray-50"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions (optional)
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="You are a helpful AI assistant. Answer questions accurately and concisely."
                rows={3}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Instructions that tell the AI how to behave and what to do.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentCreationModal;


import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AgentForm from "./agent/AgentForm";
import { useAgentCreation } from "@/hooks/useAgentCreation";

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
  
  const {
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
  } = useAgentCreation(user?.id, onAgentCreated, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] bg-white border-gray-200 shadow-lg max-h-[90vh] overflow-auto"
        style={{ opacity: 1 }}
      >
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Create a new chatbot agent to embed on your website. This will also create an OpenAI Assistant.
          </DialogDescription>
        </DialogHeader>
        
        <AgentForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          instructions={instructions}
          setInstructions={setInstructions}
          debugInfo={debugInfo}
          rawResponse={rawResponse}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AgentCreationModal;

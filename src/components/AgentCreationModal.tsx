
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import AgentCreationForm from "@/components/agent-creation/AgentCreationForm";
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
    formData,
    updateFormField,
    isSubmitting,
    creationStep,
    handleSubmit,
    renderSubmitButtonText
  } = useAgentCreation({
    userId: user?.id,
    onAgentCreated,
    onClose
  });

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
        
        <AgentCreationForm
          formData={formData}
          updateFormField={updateFormField}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          creationStep={creationStep}
          renderSubmitButtonText={renderSubmitButtonText}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AgentCreationModal;

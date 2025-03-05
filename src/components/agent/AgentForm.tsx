
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import DebugPanel from "./DebugPanel";

interface AgentFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
  debugInfo: string | null;
  rawResponse: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  instructions,
  setInstructions,
  debugInfo,
  rawResponse,
  isSubmitting,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit}>
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
        
        <DebugPanel debugInfo={debugInfo} rawResponse={rawResponse} />
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
  );
};

export default AgentForm;

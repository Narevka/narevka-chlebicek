
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { AgentFormData, AgentFormErrors, CreationStep } from "@/hooks/useAgentCreation";
import PublicityToggle from "./PublicityToggle";
import EmbedPreview from "./EmbedPreview";
import FormErrorMessage from "./FormErrorMessage";

interface AgentCreationFormProps {
  formData: AgentFormData;
  formErrors: AgentFormErrors;
  updateFormField: (field: keyof AgentFormData, value: string | boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  creationStep: CreationStep;
  renderSubmitButtonText: () => string;
  onClose: () => void;
}

const AgentCreationForm: React.FC<AgentCreationFormProps> = ({
  formData,
  formErrors,
  updateFormField,
  handleSubmit,
  isSubmitting,
  renderSubmitButtonText,
  onClose
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                placeholder="My AI Assistant"
                required
                className={`bg-gray-50 ${formErrors.name ? 'border-red-400' : ''}`}
                aria-invalid={Boolean(formErrors.name)}
                maxLength={50}
              />
              <FormErrorMessage message={formErrors.name || ''} />
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  {formData.name.length}/50
                </span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => updateFormField("description", e.target.value)}
                placeholder="A helpful assistant for my website"
                className={`bg-gray-50 ${formErrors.description ? 'border-red-400' : ''}`}
                aria-invalid={Boolean(formErrors.description)}
                maxLength={200}
              />
              <FormErrorMessage message={formErrors.description || ''} />
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  {formData.description.length}/200
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions (optional)
              </label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => updateFormField("instructions", e.target.value)}
                placeholder="You are a helpful AI assistant. Answer questions accurately and concisely."
                rows={3}
                className={`bg-gray-50 ${formErrors.instructions ? 'border-red-400' : ''}`}
                aria-invalid={Boolean(formErrors.instructions)}
                maxLength={1000}
              />
              <FormErrorMessage message={formErrors.instructions || ''} />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  Instructions that tell the AI how to behave and what to do.
                </p>
                <span className="text-xs text-gray-500">
                  {formData.instructions.length}/1000
                </span>
              </div>
            </div>
            
            <PublicityToggle 
              isPublic={formData.isPublic} 
              onToggle={(value) => updateFormField("isPublic", value)} 
            />
          </div>
          
          <div className="col-span-2">
            <EmbedPreview formData={formData} />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {renderSubmitButtonText()}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AgentCreationForm;

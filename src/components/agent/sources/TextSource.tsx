
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TextSourceProps {
  onAddText?: (text: string) => void;
}

const TextSource = ({ onAddText }: TextSourceProps) => {
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddText = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the callback function to handle the text
      if (onAddText) {
        await onAddText(inputText);
        setInputText(""); // Clear input after successful addition
      }
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Text</h2>
      
      <div className="mb-4">
        <Textarea 
          placeholder="Enter text ..." 
          className="min-h-[400px] mb-4 resize-none"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleAddText}
            disabled={isSubmitting || !inputText.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Text"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextSource;

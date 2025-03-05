
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const TextSource = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Text</h2>
      
      <div className="mb-4">
        <Textarea 
          placeholder="Enter text ..." 
          className="min-h-[400px] mb-4 resize-none"
        />
        <div className="flex justify-end">
          <Button>
            Add Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextSource;


import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QAControlsProps {
  onSave: () => void;
  onDeleteAll: () => void;
  onAddPair: () => void;
}

const QAControls = ({ onSave, onDeleteAll, onAddPair }: QAControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <Button onClick={onSave} size="sm" className="bg-purple-600 hover:bg-purple-700">
          Save Q&A
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onDeleteAll}
        >
          Delete all
        </Button>
        <Button size="sm" onClick={onAddPair}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default QAControls;

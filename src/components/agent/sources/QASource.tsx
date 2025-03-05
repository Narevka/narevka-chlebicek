
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

const QASource = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Q&A</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div></div> {/* Empty div for spacing */}
        <div className="flex gap-2">
          <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            Delete all
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <Textarea 
            className="w-full min-h-[100px] resize-none"
          />
        </div>
        
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <Textarea 
            className="w-full min-h-[150px] resize-none"
          />
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-red-500 p-2">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QASource;

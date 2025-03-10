
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface QAPairProps {
  id: string;
  question: string;
  answer: string;
  onQuestionChange: (id: string, value: string) => void;
  onAnswerChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

const QAPair = ({
  id,
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  onDelete
}: QAPairProps) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </Label>
        <Textarea 
          value={question}
          onChange={(e) => onQuestionChange(id, e.target.value)}
          className="w-full min-h-[100px] resize-none"
          placeholder="Enter your question here..."
        />
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
      </div>
      
      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Answer
        </Label>
        <Textarea 
          value={answer}
          onChange={(e) => onAnswerChange(id, e.target.value)}
          className="w-full min-h-[150px] resize-none"
          placeholder="Enter your answer here..."
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 p-2"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QAPair;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface QASourceProps {
  onAddQA?: (question: string, answer: string) => void;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

const QASource = ({ onAddQA }: QASourceProps) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([
    { id: '1', question: '', answer: '' }
  ]);

  const handleQuestionChange = (id: string, value: string) => {
    setQaPairs(pairs => 
      pairs.map(pair => 
        pair.id === id ? { ...pair, question: value } : pair
      )
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQaPairs(pairs => 
      pairs.map(pair => 
        pair.id === id ? { ...pair, answer: value } : pair
      )
    );
  };

  const handleAddPair = () => {
    setQaPairs(pairs => [
      ...pairs, 
      { id: Date.now().toString(), question: '', answer: '' }
    ]);
  };

  const handleDeletePair = (id: string) => {
    setQaPairs(pairs => pairs.filter(pair => pair.id !== id));
  };

  const handleDeleteAll = () => {
    setQaPairs([{ id: '1', question: '', answer: '' }]);
  };

  const handleSave = () => {
    // Validate at least one Q&A pair with content
    const validPairs = qaPairs.filter(pair => 
      pair.question.trim() !== '' && pair.answer.trim() !== ''
    );

    if (validPairs.length === 0) {
      toast.error("Please add at least one question and answer pair");
      return;
    }

    // Process each valid Q&A pair
    validPairs.forEach(pair => {
      if (onAddQA) {
        onAddQA(pair.question, pair.answer);
      }
    });

    // Reset form after saving
    setQaPairs([{ id: '1', question: '', answer: '' }]);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Q&A</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button onClick={handleSave} size="sm" className="bg-purple-600 hover:bg-purple-700">
            Save Q&A
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteAll}
          >
            Delete all
          </Button>
          <Button size="sm" onClick={handleAddPair}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {qaPairs.map((pair, index) => (
        <div key={pair.id} className="border rounded-md p-4 mb-4">
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </Label>
            <Textarea 
              value={pair.question}
              onChange={(e) => handleQuestionChange(pair.id, e.target.value)}
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
              value={pair.answer}
              onChange={(e) => handleAnswerChange(pair.id, e.target.value)}
              className="w-full min-h-[150px] resize-none"
              placeholder="Enter your answer here..."
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 p-2"
              onClick={() => handleDeletePair(pair.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QASource;

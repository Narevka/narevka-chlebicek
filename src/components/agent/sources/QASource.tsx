
import React, { useState } from "react";
import { toast } from "sonner";
import QAPair from "./qa/QAPair";
import QAControls from "./qa/QAControls";

interface QASourceProps {
  onAddQA?: (question: string, answer: string) => void;
}

interface QAPairData {
  id: string;
  question: string;
  answer: string;
}

const QASource = ({ onAddQA }: QASourceProps) => {
  const [qaPairs, setQaPairs] = useState<QAPairData[]>([
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
    const validPairs = qaPairs.filter(pair => 
      pair.question.trim() !== '' && pair.answer.trim() !== ''
    );

    if (validPairs.length === 0) {
      toast.error("Please add at least one question and answer pair");
      return;
    }

    validPairs.forEach(pair => {
      if (onAddQA) {
        onAddQA(pair.question, pair.answer);
      }
    });

    setQaPairs([{ id: '1', question: '', answer: '' }]);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Q&A</h2>
      
      <QAControls 
        onSave={handleSave}
        onDeleteAll={handleDeleteAll}
        onAddPair={handleAddPair}
      />
      
      {qaPairs.map((pair) => (
        <QAPair
          key={pair.id}
          id={pair.id}
          question={pair.question}
          answer={pair.answer}
          onQuestionChange={handleQuestionChange}
          onAnswerChange={handleAnswerChange}
          onDelete={handleDeletePair}
        />
      ))}
    </div>
  );
};

export default QASource;

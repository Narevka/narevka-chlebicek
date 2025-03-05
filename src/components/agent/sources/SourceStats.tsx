
import React from "react";
import { Button } from "@/components/ui/button";

interface SourceStatsProps {
  fileSources?: number;
  fileChars?: number;
  textSources?: number;
  textChars?: number;
  websiteSources?: number;
  websiteChars?: number;
  qaSources?: number;
  qaChars?: number;
  totalChars?: number;
  charLimit?: number;
  onRetrainClick?: () => void;
  isRetraining?: boolean;
}

const SourceStats = ({
  fileSources = 0,
  fileChars = 0,
  textSources = 0,
  textChars = 0,
  websiteSources = 0,
  websiteChars = 0,
  qaSources = 0,
  qaChars = 0,
  totalChars = 0,
  charLimit = 400000,
  onRetrainClick,
  isRetraining = false
}: SourceStatsProps) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-center mb-6">Sources</h3>
      
      <div className="space-y-2 mb-6">
        {fileSources > 0 && (
          <p className="text-gray-700">{fileSources} Files ({fileChars.toLocaleString()} detected chars)</p>
        )}
        {textSources > 0 && (
          <p className="text-gray-700">{textSources} Text entries ({textChars.toLocaleString()} detected chars)</p>
        )}
        {websiteSources > 0 && (
          <p className="text-gray-700">{websiteSources} Links ({websiteChars.toLocaleString()} detected chars)</p>
        )}
        {qaSources > 0 && (
          <p className="text-gray-700">{qaSources} Q&A pairs ({qaChars.toLocaleString()} detected chars)</p>
        )}
        {fileSources === 0 && textSources === 0 && websiteSources === 0 && qaSources === 0 && (
          <p className="text-gray-500 italic">No sources added yet</p>
        )}
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="font-medium">Total detected characters</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{totalChars.toLocaleString()}</span>
          <span className="text-gray-500">/ {charLimit.toLocaleString()} limit</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (totalChars / charLimit) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-black hover:bg-gray-800 text-white"
        onClick={onRetrainClick}
        disabled={isRetraining || (totalChars === 0)}
      >
        {isRetraining ? "Retraining..." : "Retrain agent"}
      </Button>
    </div>
  );
};

export default SourceStats;

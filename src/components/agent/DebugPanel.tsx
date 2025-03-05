
import React from "react";

interface DebugPanelProps {
  debugInfo: string | null;
  rawResponse: string | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ debugInfo, rawResponse }) => {
  if (!debugInfo && !rawResponse) return null;
  
  return (
    <>
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-auto max-h-60">
          <p className="font-medium mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}
      
      {rawResponse && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-auto max-h-60">
          <p className="font-medium mb-1">Raw Response Data:</p>
          {rawResponse}
        </div>
      )}
    </>
  );
};

export default DebugPanel;

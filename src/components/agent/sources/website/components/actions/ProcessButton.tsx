
import React from "react";
import { Upload, CheckCircle } from "lucide-react";
import ActionTooltipButton from "./ActionTooltipButton";

interface ProcessButtonProps {
  isProcessing?: boolean;
  isProcessed?: boolean;
  onProcess: () => void;
}

const ProcessButton: React.FC<ProcessButtonProps> = ({
  isProcessing,
  isProcessed,
  onProcess
}) => {
  if (isProcessing) {
    return (
      <ActionTooltipButton
        icon={Upload}
        tooltip="Processing..."
        disabled={true}
        variant="default"
        className="animate-pulse"
      />
    );
  }
  
  if (isProcessed) {
    return (
      <ActionTooltipButton
        icon={CheckCircle}
        tooltip="Processed and added to agent"
        disabled={true}
        variant="default"
        className="bg-green-600 hover:bg-green-700"
      />
    );
  }
  
  return (
    <ActionTooltipButton
      icon={Upload}
      tooltip="Process and add to agent"
      onClick={onProcess}
      variant="default"
    />
  );
};

export default ProcessButton;

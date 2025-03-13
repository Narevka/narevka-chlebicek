
import React from "react";
import { RefreshCw } from "lucide-react";
import ActionTooltipButton from "./ActionTooltipButton";

interface StatusButtonProps {
  sourceId?: string;
  isProcessing?: boolean;
  onCheckStatus: () => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({
  sourceId,
  isProcessing,
  onCheckStatus
}) => {
  return (
    <ActionTooltipButton
      icon={RefreshCw}
      tooltip="Check status"
      onClick={onCheckStatus}
      disabled={!sourceId || isProcessing}
    />
  );
};

export default StatusButton;

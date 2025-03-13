
import React from "react";
import { Download } from "lucide-react";
import ActionTooltipButton from "./ActionTooltipButton";

interface DownloadButtonProps {
  onDownload: () => void;
  isDownloading?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  onDownload,
  isDownloading
}) => {
  return (
    <ActionTooltipButton
      icon={Download}
      tooltip="Download content"
      onClick={onDownload}
      disabled={isDownloading}
    />
  );
};

export default DownloadButton;


import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UploadButtonProps {
  onUpload: () => void;
  isUploading: boolean;
  hasFiles: boolean;
}

const UploadButton = ({ onUpload, isUploading, hasFiles }: UploadButtonProps) => {
  if (!hasFiles) return null;

  return (
    <div className="flex justify-end mt-4">
      <Button 
        onClick={onUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Files"
        )}
      </Button>
    </div>
  );
};

export default UploadButton;

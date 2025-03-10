
import React from "react";
import { FileTextIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

const FileList = ({ files, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-4 mb-4">
      <h3 className="text-sm font-medium mb-2">Selected Files ({files.length})</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <div className="flex items-center">
              <FileTextIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemoveFile(index)}
              className="h-6 w-6 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;

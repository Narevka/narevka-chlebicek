
import React, { useRef } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface FileUploadAreaProps {
  onFileSelect: (files: FileList) => void;
}

const FileUploadArea = ({ onFileSelect }: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div 
          className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadIcon className="h-8 w-8 text-gray-400 mb-4" />
          <p className="text-center mb-4">Drag & drop files here, or click to select files</p>
          <p className="text-sm text-gray-500 mb-4">Supported file types: .pdf, .doc, .docx, .txt, .md</p>
          <Button onClick={handleUploadClick}>
            Select Files
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadArea;

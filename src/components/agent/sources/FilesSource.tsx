
import React, { useState, useRef } from "react";
import { UploadIcon, Loader2, FileTextIcon, XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FilesSourceProps {
  onAddFiles?: (files: File[]) => void;
}

const FilesSource = ({ onAddFiles }: FilesSourceProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Check file types
      const validFiles = newFiles.filter(file => {
        const validTypes = [".pdf", ".doc", ".docx", ".txt", ".md"];
        const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isValid) {
          toast.error(`File type not supported: ${file.name}`);
        }
        return isValid;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
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
      const newFiles = Array.from(e.dataTransfer.files);
      // Check file types
      const validFiles = newFiles.filter(file => {
        const validTypes = [".pdf", ".doc", ".docx", ".txt", ".md"];
        const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isValid) {
          toast.error(`File type not supported: ${file.name}`);
        }
        return isValid;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    
    // Call the callback function to handle the files
    if (onAddFiles) {
      onAddFiles(selectedFiles);
      toast.success("Files uploaded successfully");
      setSelectedFiles([]); // Clear files after successful upload
    }
    
    setIsUploading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Files</h2>
      
      <Card className="mb-2">
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
      
      {selectedFiles.length > 0 && (
        <div className="mt-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center">
                  <FileTextIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSubmitFiles}
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
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-2">
        If you are uploading a PDF, make sure you can select/highlight the text.
      </p>
    </div>
  );
};

export default FilesSource;

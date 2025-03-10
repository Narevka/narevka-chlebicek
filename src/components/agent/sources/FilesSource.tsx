
import React, { useState } from "react";
import { toast } from "sonner";
import FileUploadArea from "./files/FileUploadArea";
import FileList from "./files/FileList";
import UploadButton from "./files/UploadButton";

interface FilesSourceProps {
  onAddFiles?: (files: File[]) => void;
}

const FilesSource = ({ onAddFiles }: FilesSourceProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter(file => {
      const validTypes = [".pdf", ".doc", ".docx", ".txt", ".md"];
      const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isValid) {
        toast.error(`File type not supported: ${file.name}`);
      }
      return isValid;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    try {
      if (onAddFiles) {
        await onAddFiles(selectedFiles);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Files</h2>
      
      <FileUploadArea onFileSelect={handleFileSelect} />
      
      <FileList 
        files={selectedFiles}
        onRemoveFile={handleRemoveFile}
      />
      
      <UploadButton 
        onUpload={handleSubmitFiles}
        isUploading={isUploading}
        hasFiles={selectedFiles.length > 0}
      />
      
      <p className="text-sm text-gray-500 mt-2">
        If you are uploading a PDF, make sure you can select/highlight the text.
      </p>
    </div>
  );
};

export default FilesSource;

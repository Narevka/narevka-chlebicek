
import React from "react";
import { UploadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FilesSource = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Files</h2>
      
      <Card className="mb-2">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-md">
            <UploadIcon className="h-8 w-8 text-gray-400 mb-4" />
            <p className="text-center mb-4">Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-500 mb-4">Supported file types: .pdf, .doc, .docx, .txt</p>
            <Button>
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 mt-2">
        If you are uploading a PDF, make sure you can select/highlight the text.
      </p>
    </div>
  );
};

export default FilesSource;

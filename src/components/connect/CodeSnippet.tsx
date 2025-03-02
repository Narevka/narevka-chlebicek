
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippetProps {
  code: string;
}

const CodeSnippet = ({ code }: CodeSnippetProps) => {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard",
      duration: 3000,
    });
  };
  
  const lines = code.split("\n");
  
  return (
    <div className="relative bg-gray-50 border rounded-md overflow-hidden">
      <div className="absolute top-2 right-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 bg-white" 
          onClick={handleCopy}
        >
          <ClipboardCopy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
      
      <div className="p-4 pt-12 pb-4 overflow-x-auto font-mono text-sm">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <div className="text-gray-400 w-6 text-right mr-4 select-none">
              {i + 1}
            </div>
            <div className="text-gray-800">{line}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeSnippet;

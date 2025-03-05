
import React from "react";
import { FilesIcon, Text, Globe, MessageSquare } from "lucide-react";
import SourceTypeButton from "./SourceTypeButton";

export type SourceType = "files" | "text" | "website" | "qa";

interface SourcesSidebarProps {
  activeSource: SourceType;
  setActiveSource: (source: SourceType) => void;
}

const SourcesSidebar = ({ activeSource, setActiveSource }: SourcesSidebarProps) => {
  return (
    <div className="w-64 border-r bg-gray-50 h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Sources</h2>
        <nav className="space-y-1">
          <SourceTypeButton 
            icon={<FilesIcon className="h-4 w-4" />} 
            label="Files" 
            active={activeSource === "files"}
            onClick={() => setActiveSource("files")}
          />
          <SourceTypeButton 
            icon={<Text className="h-4 w-4" />} 
            label="Text" 
            active={activeSource === "text"}
            onClick={() => setActiveSource("text")}
          />
          <SourceTypeButton 
            icon={<Globe className="h-4 w-4" />} 
            label="Website" 
            active={activeSource === "website"}
            onClick={() => setActiveSource("website")}
          />
          <SourceTypeButton 
            icon={<MessageSquare className="h-4 w-4" />} 
            label="Q&A" 
            active={activeSource === "qa"}
            onClick={() => setActiveSource("qa")}
          />
        </nav>
      </div>
    </div>
  );
};

export default SourcesSidebar;


import React, { useState } from "react";
import { FilesIcon, Text, Globe, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FilesSource from "./sources/FilesSource";
import TextSource from "./sources/TextSource";
import WebsiteSource from "./sources/WebsiteSource";
import QASource from "./sources/QASource";
import SourceStats from "./sources/SourceStats";

type SourceType = "files" | "text" | "website" | "qa";

const SourcesTab = () => {
  const [activeSource, setActiveSource] = useState<SourceType>("files");

  const renderSourceContent = () => {
    switch (activeSource) {
      case "files":
        return <FilesSource />;
      case "text":
        return <TextSource />;
      case "website":
        return <WebsiteSource />;
      case "qa":
        return <QASource />;
      default:
        return <FilesSource />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar - source types */}
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

      {/* Main content area */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-auto">
          {renderSourceContent()}
        </div>
        
        {/* Right stats sidebar */}
        <div className="w-80 p-6 border-l">
          <SourceStats />
        </div>
      </div>
    </div>
  );
};

interface SourceTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SourceTypeButton = ({ icon, label, active, onClick }: SourceTypeButtonProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start py-2 px-3 text-sm font-medium",
        active
          ? "bg-purple-100 text-purple-800"
          : "text-gray-700 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <span className={cn("mr-3", active ? "text-purple-800" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </Button>
  );
};

export default SourcesTab;


import React from "react";
import { Card } from "@/components/ui/card";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentFormData } from "@/hooks/useAgentCreation";

interface EmbedPreviewProps {
  formData: AgentFormData;
  previewType?: "desktop" | "mobile";
}

const EmbedPreview: React.FC<EmbedPreviewProps> = ({
  formData,
  previewType = "desktop"
}) => {
  const [activePreview, setActivePreview] = React.useState<"desktop" | "mobile">(previewType);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Preview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActivePreview("desktop")}
            className={cn(
              "p-1 rounded-md",
              activePreview === "desktop" ? "bg-gray-100 text-gray-900" : "text-gray-500"
            )}
            aria-label="Desktop preview"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActivePreview("mobile")}
            className={cn(
              "p-1 rounded-md",
              activePreview === "mobile" ? "bg-gray-100 text-gray-900" : "text-gray-500"
            )}
            aria-label="Mobile preview"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className={cn(
        "border overflow-hidden transition-all duration-200 ease-in-out",
        activePreview === "desktop" ? "w-full aspect-[4/3]" : "w-[240px] mx-auto aspect-[9/16]"
      )}>
        <div className="bg-indigo-600 text-white p-3 text-sm font-medium">
          {formData.name || "AI Assistant"}
        </div>
        <div className="bg-gray-50 p-4 flex flex-col h-[calc(100%-40px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm max-w-[80%]">
              Hi there! How can I help you today?
            </div>
            {formData.instructions && (
              <div className="bg-indigo-100 text-gray-800 p-2 rounded-lg text-sm max-w-[80%]">
                <span className="text-xs text-gray-500 block mb-1">Based on instructions:</span>
                {formData.instructions.substring(0, 100)}
                {formData.instructions.length > 100 && "..."}
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2 items-center">
            <input
              type="text"
              disabled
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md text-sm bg-white"
            />
            <button
              disabled
              className="bg-indigo-600 text-white p-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmbedPreview;

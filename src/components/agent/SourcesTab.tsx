
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import FilesSource from "./sources/FilesSource";
import TextSource from "./sources/TextSource";
import WebsiteSource from "./sources/WebsiteSource";
import QASource from "./sources/QASource";
import SourceStats from "./sources/SourceStats";
import SourcesSidebar, { SourceType } from "./sources/SourcesSidebar";
import { useAgentSources } from "@/hooks/useAgentSources";

const SourcesTab = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [activeSource, setActiveSource] = useState<SourceType>("files");
  
  const {
    isLoading,
    isRetraining,
    handleAddText,
    handleAddFiles,
    handleAddQA,
    handleRetrainAgent,
    getSourceStats
  } = useAgentSources(agentId);

  // Get source statistics
  const stats = getSourceStats();

  const renderSourceContent = () => {
    switch (activeSource) {
      case "files":
        return <FilesSource onAddFiles={handleAddFiles} />;
      case "text":
        return <TextSource onAddText={handleAddText} />;
      case "website":
        return <WebsiteSource />;
      case "qa":
        return <QASource onAddQA={handleAddQA} />;
      default:
        return <FilesSource onAddFiles={handleAddFiles} />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar - source types */}
      <SourcesSidebar 
        activeSource={activeSource} 
        setActiveSource={setActiveSource} 
      />

      {/* Main content area */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading sources...</p>
            </div>
          ) : (
            renderSourceContent()
          )}
        </div>
        
        {/* Right stats sidebar */}
        <div className="w-80 p-6 border-l">
          <SourceStats 
            fileSources={stats.filesSources.length}
            fileChars={stats.fileChars}
            textSources={stats.textSources.length}
            textChars={stats.textChars}
            websiteSources={stats.websiteSources.length}
            websiteChars={stats.websiteChars}
            qaSources={stats.qaSources.length}
            qaChars={stats.qaChars}
            totalChars={stats.totalChars}
            charLimit={400000}
            onRetrainClick={handleRetrainAgent}
            isRetraining={isRetraining}
          />
        </div>
      </div>
    </div>
  );
};

export default SourcesTab;

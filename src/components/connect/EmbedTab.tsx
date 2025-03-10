
import React, { useState } from "react";
import EmbedTypeSelection from "./embed/EmbedTypeSelection";
import ConfigSection from "./embed/ConfigSection";
import BackendStatus from "./embed/BackendStatus";

interface EmbedTabProps {
  agentId: string | undefined;
  agentName: string | undefined;
  agentDescription: string | undefined;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
}

const EmbedTab: React.FC<EmbedTabProps> = ({
  agentId,
  agentName,
  agentDescription,
  customDomain,
  setCustomDomain,
}) => {
  const [embedType, setEmbedType] = useState<"bubble" | "iframe">("bubble");
  const [website, setWebsite] = useState("www.example.com");

  return (
    <>
      <EmbedTypeSelection 
        embedType={embedType} 
        setEmbedType={setEmbedType} 
      />
      
      <ConfigSection
        agentId={agentId}
        agentName={agentName}
        agentDescription={agentDescription}
        customDomain={customDomain}
        setCustomDomain={setCustomDomain}
        embedType={embedType}
        website={website}
        setWebsite={setWebsite}
      />
      
      <BackendStatus />
    </>
  );
};

export default EmbedTab;

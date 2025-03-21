
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAgentDetail } from "@/hooks/useAgentDetail";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft } from "lucide-react";

import ConnectSidebar from "@/components/connect/ConnectSidebar";
import EmbedTab from "@/components/connect/EmbedTab";
import ShareTab from "@/components/connect/ShareTab";
import IntegrationsTab from "@/components/connect/IntegrationsTab";
import { Button } from "@/components/ui/button";

const Connect = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { agent, loading } = useAgentDetail(id || "", user?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("embed");
  const [customDomain, setCustomDomain] = useState(window.location.origin);
  const [secretKey] = useState(() => {
    return uuidv4();
  });

  useEffect(() => {
    if (!location.hash || location.hash === "#embed") {
      setActiveTab("embed");
    } else if (location.hash === "#share") {
      setActiveTab("share");
    } else if (location.hash === "#integrations") {
      setActiveTab("integrations");
    }
  }, [location.hash]);

  const handleBackToAgent = () => {
    navigate(`/agents/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <ConnectSidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToAgent} 
              className="flex items-center text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Agent
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-6">Connect</h1>
          <p>Loading agent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ConnectSidebar />
      <div className="flex-1 p-6 overflow-y-auto pb-24">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToAgent} 
            className="flex items-center text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Agent
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">
          Connect {agent?.name && `"${agent.name}"`}
        </h1>
        
        {activeTab === "embed" && (
          <EmbedTab 
            agentId={id}
            agentName={agent?.name}
            agentDescription={agent?.description}
            customDomain={customDomain}
            setCustomDomain={setCustomDomain}
          />
        )}

        {activeTab === "share" && (
          <ShareTab 
            agentId={id}
            customDomain={customDomain}
          />
        )}

        {activeTab === "integrations" && (
          <IntegrationsTab 
            agentId={id}
            secretKey={secretKey}
            customDomain={customDomain}
          />
        )}
      </div>
    </div>
  );
};

export default Connect;

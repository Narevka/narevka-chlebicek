
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw } from "lucide-react";
import { useAgentDetail } from "@/hooks/useAgentDetail";
import PlaygroundTab from "@/components/agent/PlaygroundTab";
import ActivityTab from "@/components/agent/ActivityTab";
import AnalyticsTab from "@/components/agent/AnalyticsTab";
import SourcesTab from "@/components/agent/SourcesTab";
import SettingsTab from "@/components/agent/SettingsTab";
import AgentDetailSidebar from "@/components/agent/AgentDetailSidebar";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agent, loading } = useAgentDetail(id || "", user?.id);
  const [activeTab, setActiveTab] = React.useState<string>("playground");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading agent...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "playground":
        return <PlaygroundTab agentName={agent?.name || "Agent"} agentId={id || ""} />;
      case "activity":
        return <ActivityTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "sources":
        return <SourcesTab />;
      case "settings":
        return <SettingsTab />;
      case "connect":
        navigate(`/agents/${id}/connect`);
        return null;
      default:
        return <PlaygroundTab agentName={agent?.name || "Agent"} agentId={id || ""} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex">
      {/* Sidebar */}
      <AgentDetailSidebar 
        agentName={agent?.name || "Agent"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentId={id || ""}
      />

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AgentDetail;

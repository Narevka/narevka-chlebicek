
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";
import "../ui/scrollbar.css";
import SubTabs from "./activity/SubTabs";
import ChatLogsSection from "./activity/ChatLogsSection";
import LeadsSection from "./activity/LeadsSection";

const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState<string>("chatLogs");
  const { user } = useAuth();
  const { id: agentId } = useParams<{ id: string }>();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your activity.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar with icons */}
      <div className="w-[240px] border-r p-4">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        <SubTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content area */}
      <div className="flex-1">
        {activeTab === "chatLogs" ? (
          <ChatLogsSection agentId={agentId} />
        ) : (
          <LeadsSection />
        )}
      </div>
    </div>
  );
};

export default ActivityTab;

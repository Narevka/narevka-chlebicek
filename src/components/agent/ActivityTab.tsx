
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import "../ui/scrollbar.css";
import SubTabs from "./activity/SubTabs";
import ChatLogsSection from "./activity/ChatLogsSection";
import LeadsSection from "./activity/LeadsSection";

const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState<string>("chatLogs");
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your activity.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar with icons */}
      <div className="w-[240px] border-r bg-white p-4">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        <SubTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {activeTab === "chatLogs" ? (
          <ChatLogsSection />
        ) : (
          <LeadsSection />
        )}
      </div>
    </div>
  );
};

export default ActivityTab;

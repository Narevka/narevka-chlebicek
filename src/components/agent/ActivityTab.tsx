
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Activity</h1>
      
      <p className="text-gray-600 mb-6">
        This section shows the chats log of the conversations done by the AI Agent and the Leads form filled by the users.
      </p>
      
      <SubTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "chatLogs" ? (
        <ChatLogsSection />
      ) : (
        <LeadsSection />
      )}
    </div>
  );
};

export default ActivityTab;

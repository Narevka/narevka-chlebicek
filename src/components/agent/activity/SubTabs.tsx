
import { MessageSquare, Users } from "lucide-react";
import React from "react";

interface SubTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubTabs = ({ activeTab, setActiveTab }: SubTabsProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <button
        className={`flex items-center px-4 py-2 rounded-md text-left ${
          activeTab === "chatLogs"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("chatLogs")}
      >
        <MessageSquare className={`h-4 w-4 mr-3 ${activeTab === "chatLogs" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Chat Logs</span>
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-md text-left ${
          activeTab === "leads"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("leads")}
      >
        <Users className={`h-4 w-4 mr-3 ${activeTab === "leads" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Leads</span>
      </button>
    </div>
  );
};

export default SubTabs;

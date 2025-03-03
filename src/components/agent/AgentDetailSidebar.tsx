
import React from "react";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Database, 
  Settings,
  Link2,
  ChevronLeft,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AgentDetailSidebarProps {
  agentName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  agentId: string;
}

const AgentDetailSidebar = ({ agentName, activeTab, setActiveTab, agentId }: AgentDetailSidebarProps) => {
  return (
    <div className="w-64 border-r bg-gray-50 h-screen flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="flex items-center text-sm font-medium">
          <Link to="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg truncate" title={agentName}>{agentName}</h2>
      </div>

      <div className="px-3 py-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Search..."
            type="text"
          />
        </div>
        
        <p className="px-3 text-xs font-medium text-gray-400 uppercase mb-2">Navigation</p>
        <nav className="space-y-1 mb-6">
          <MenuItem 
            icon={<MessageSquare className="h-4 w-4" />} 
            label="Playground" 
            active={activeTab === "playground"}
            onClick={() => setActiveTab("playground")}
          />
          <MenuItem 
            icon={<FileText className="h-4 w-4" />} 
            label="Activity" 
            active={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
          />
          <MenuItem 
            icon={<BarChart3 className="h-4 w-4" />} 
            label="Analytics" 
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />
          <MenuItem 
            icon={<Database className="h-4 w-4" />} 
            label="Sources" 
            active={activeTab === "sources"}
            onClick={() => setActiveTab("sources")}
          />
          <MenuItem 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
          <MenuItem 
            icon={<Link2 className="h-4 w-4" />} 
            label="Connect" 
            active={activeTab === "connect"}
            onClick={() => setActiveTab("connect")}
          />
        </nav>
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const MenuItem = ({ icon, label, active, onClick }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
        active
          ? "bg-purple-100 text-purple-800"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className={cn("mr-3", active ? "text-purple-800" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </button>
  );
};

export default AgentDetailSidebar;

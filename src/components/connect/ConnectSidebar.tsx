
import React from "react";
import { Code, Share, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  onClick
}: SidebarItemProps) => (
  <div 
    className={cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md cursor-pointer",
      active ? "text-purple-600 bg-purple-50" : "text-gray-700 hover:bg-gray-100"
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </div>
);

const ConnectSidebar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<string>("embed");
  
  // Determine if we're on the embed tab
  React.useEffect(() => {
    // Default to embed tab
    if (!location.hash || location.hash === "#embed") {
      setActiveTab("embed");
    } else if (location.hash === "#share") {
      setActiveTab("share");
    } else if (location.hash === "#integrations") {
      setActiveTab("integrations");
    }
  }, [location]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="w-64 border-r border-gray-200 pt-6 flex flex-col">
      <SidebarItem 
        icon={Code} 
        label="Embed" 
        active={activeTab === "embed"} 
        onClick={() => handleTabClick("embed")}
      />
      <SidebarItem 
        icon={Share} 
        label="Share" 
        active={activeTab === "share"} 
        onClick={() => handleTabClick("share")}
      />
      <SidebarItem 
        icon={Box} 
        label="Integrations" 
        active={activeTab === "integrations"} 
        onClick={() => handleTabClick("integrations")}
      />
    </div>
  );
};

export default ConnectSidebar;

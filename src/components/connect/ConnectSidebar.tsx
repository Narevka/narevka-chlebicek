
import React from "react";
import { Code, Share, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  active?: boolean 
}) => (
  <div 
    className={cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md cursor-pointer",
      active ? "text-purple-600 bg-purple-50" : "text-gray-700 hover:bg-gray-100"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </div>
);

const ConnectSidebar = () => {
  return (
    <div className="w-64 border-r border-gray-200 pt-6 flex flex-col">
      <SidebarItem icon={Code} label="Embed" active />
      <SidebarItem icon={Share} label="Share" />
      <SidebarItem icon={Box} label="Integrations" />
    </div>
  );
};

export default ConnectSidebar;

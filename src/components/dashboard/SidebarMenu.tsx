
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Home, List, Settings, MessageSquare, HelpCircle, Search } from "lucide-react";

const SidebarMenu = () => {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getUserInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header with logo and collapse button */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="bg-black rounded p-2 mr-3">
            <span className="text-white font-bold">C</span>
          </div>
          {!collapsed && <span className="font-medium">Narevka Studio</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={collapsed ? "" : "Search for anything..."}
            className={cn(
              "pl-9 pr-4 py-2 w-full rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              collapsed ? "pl-8 pr-2" : ""
            )}
          />
        </div>
      </div>

      {/* Menu section title */}
      {!collapsed && (
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase">Main</p>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 px-2 py-2">
        <ul className="space-y-1">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <Home size={collapsed ? 20 : 16} />
              {!collapsed && <span>Home</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <List size={collapsed ? 20 : 16} />
              {!collapsed && <span>Agents</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/docs"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <MessageSquare size={collapsed ? 20 : 16} />
              {!collapsed && <span>Documentation</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Usage section with progress */}
      <div className={cn(
        "mx-4 mb-4 p-4 bg-purple-50 rounded-lg",
        collapsed ? "py-3 px-2" : "")
      }>
        <div className="flex justify-center items-center mb-2">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e0e0e0" strokeWidth="2"></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#6d5dfc"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset="40"
                transform="rotate(-90 18 18)"
              ></circle>
            </svg>
            <div className="absolute text-sm font-semibold text-purple-700">
              60%
            </div>
          </div>
        </div>
        
        {!collapsed && (
          <>
            <p className="text-sm font-medium text-center mb-1">Used capacity</p>
            <p className="text-xs text-gray-600 text-center mb-3">
              You are already using 60% of your capacity.
            </p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium">
              Upgrade plan
            </button>
          </>
        )}
      </div>

      {/* Settings and Help */}
      <div className="px-2 py-2">
        <ul className="space-y-1">
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <Settings size={collapsed ? 20 : 16} />
              {!collapsed && <span>Settings</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <HelpCircle size={collapsed ? 20 : 16} />
              {!collapsed && <span>Help</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* User profile */}
      <div className="mt-2 p-3">
        <Separator className="mb-3" />
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-teal-600">
            <AvatarFallback className="text-white font-medium">{getUserInitial()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;


import { useAuth } from "@/context/AuthContext";
import { Grid, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopNavigationBar = () => {
  const { user } = useAuth();

  const getUserInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded hover:bg-gray-100">
            <Grid size={20} />
          </button>
          <div className="flex items-center">
            <div className="bg-black rounded p-2 mr-3">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-medium mr-1">Narevka Studio</span>
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-gray-600 text-sm font-medium">Docs</button>
          <button className="text-gray-600 text-sm font-medium">Help</button>
          <button className="text-gray-600 text-sm font-medium">Changelog</button>
          <Avatar className="h-8 w-8 bg-teal-600">
            <AvatarFallback className="text-white font-medium">{getUserInitial()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default TopNavigationBar;


import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Grid, ChevronDown, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();

  // Show loading message when checking session state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <p className="text-lg">Ładowanie...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Top Navigation Bar */}
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
              <span className="text-white font-medium">N</span>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <Tabs defaultValue="agents" className="w-full">
          <div className="border-b border-gray-200">
            <div className="max-w-5xl mx-auto">
              <TabsList className="flex justify-center h-12 bg-transparent border-none">
                <TabsTrigger 
                  value="agents" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-8 h-full"
                >
                  Agents
                </TabsTrigger>
                <TabsTrigger 
                  value="usage" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-8 h-full"
                >
                  Usage
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-8 h-full"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full p-4">
            <TabsContent value="agents" className="mt-6">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Agents</h1>
                <Button className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2">
                  New agent
                </Button>
              </div>

              {/* Agent Card */}
              <div className="border border-gray-200 rounded-md w-60 overflow-hidden">
                <div className="bg-gray-100 p-10 flex justify-center items-center">
                  <MessageSquare className="text-gray-500" size={48} />
                </div>
                <div className="p-4">
                  <p className="font-medium text-center">toknowai.pl</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <h1 className="text-3xl font-bold mb-8">Usage</h1>
              <p className="text-gray-600">Usage statistics will appear here.</p>
            </TabsContent>

            <TabsContent value="settings">
              <h1 className="text-3xl font-bold mb-8">Settings</h1>
              <p className="text-gray-600">Account and application settings will appear here.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;


import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AgentList from "./AgentList";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface DashboardTabsProps {
  agents: Agent[];
  isLoading: boolean;
  onOpenModal: () => void;
}

const DashboardTabs = ({ agents, isLoading, onOpenModal }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="agents" className="w-full">
      <div className="border-b border-gray-200">
        <div className="px-6">
          <TabsList className="h-12 bg-transparent border-none">
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

      <div className="p-6">
        <TabsContent value="agents" className="mt-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Agents</h1>
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2"
              onClick={onOpenModal}
            >
              <Plus size={16} className="mr-2" /> New agent
            </Button>
          </div>

          <AgentList 
            agents={agents} 
            isLoading={isLoading} 
            onOpenModal={onOpenModal} 
          />
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
  );
};

export default DashboardTabs;

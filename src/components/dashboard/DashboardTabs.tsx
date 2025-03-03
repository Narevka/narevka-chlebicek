
import { Plus } from "lucide-react";
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
    <div className="p-6">
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
    </div>
  );
};

export default DashboardTabs;


import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  onOpenModal: () => void;
}

const AgentList = ({ agents, isLoading, onOpenModal }: AgentListProps) => {
  const navigate = useNavigate();

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading agents...</p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border border-dashed border-gray-300 rounded-lg">
        <MessageSquare className="text-gray-400 mb-4" size={40} />
        <p className="text-gray-500 mb-2">No agents yet</p>
        <Button 
          variant="outline" 
          onClick={onOpenModal}
          className="mt-2"
        >
          Create your first agent
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <div 
          key={agent.id} 
          className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleAgentClick(agent.id)}
        >
          <div className="bg-gray-100 p-10 flex justify-center items-center">
            <MessageSquare className="text-gray-500" size={48} />
          </div>
          <div className="p-4">
            <p className="font-medium text-center">{agent.name}</p>
            {agent.description && (
              <p className="text-sm text-gray-500 text-center mt-1 truncate">
                {agent.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;

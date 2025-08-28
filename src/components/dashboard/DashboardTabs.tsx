
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentList from "./AgentList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  openai_assistant_id?: string | null;
}

interface DashboardTabsProps {
  agents: Agent[];
  isLoading: boolean;
  onOpenModal: () => void;
  onRefresh?: () => void;
}

const DashboardTabs = ({ agents, isLoading, onOpenModal, onRefresh }: DashboardTabsProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryAssistantCreation = async () => {
    setIsRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke('retry-assistant-creation');
      
      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success(`${data.message}`, {
          description: `Successfully processed ${data.successful} agents`
        });
        
        // Refresh the agent list to show updated assistant IDs
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error('Failed to retry assistant creation', {
          description: data.error
        });
      }
    } catch (error) {
      console.error('Error retrying assistant creation:', error);
      toast.error('Failed to retry assistant creation', {
        description: error.message
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Check if there are any agents without OpenAI Assistant ID
  const agentsNeedingRetry = agents.filter(agent => !agent.openai_assistant_id);
  const showRetryButton = agentsNeedingRetry.length > 0;
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agents</h1>
        <div className="flex gap-2">
          {showRetryButton && (
            <Button 
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={handleRetryAssistantCreation}
              disabled={isRetrying}
            >
              <RefreshCw size={16} className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Fixing...' : `Fix ${agentsNeedingRetry.length} Agent${agentsNeedingRetry.length > 1 ? 's' : ''}`}
            </Button>
          )}
          <Button 
            className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2"
            onClick={onOpenModal}
          >
            <Plus size={16} className="mr-2" /> New agent
          </Button>
        </div>
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

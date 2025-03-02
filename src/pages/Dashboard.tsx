
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import TopNavigationBar from "@/components/dashboard/TopNavigationBar";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import AgentCreationModal from "@/components/AgentCreationModal";
import { useAgents } from "@/hooks/useAgents";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { agents, isLoading, refreshAgents } = useAgents();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <p className="text-lg">Ładowanie...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const handleAgentCreated = () => {
    refreshAgents();
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <TopNavigationBar />

      <div className="flex-1">
        <DashboardTabs 
          agents={agents} 
          isLoading={isLoading} 
          onOpenModal={() => setIsAgentModalOpen(true)} 
        />
      </div>

      <AgentCreationModal 
        isOpen={isAgentModalOpen} 
        onClose={() => setIsAgentModalOpen(false)} 
        onAgentCreated={handleAgentCreated}
      />
    </div>
  );
};

export default Dashboard;

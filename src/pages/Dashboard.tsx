
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import AgentCreationModal from "@/components/AgentCreationModal";
import { useAgents } from "@/hooks/useAgents";
import SidebarMenu from "@/components/dashboard/SidebarMenu";

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
    <div className="min-h-screen w-full bg-white flex">
      {/* Sidebar */}
      <SidebarMenu />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <DashboardTabs 
          agents={agents} 
          isLoading={isLoading} 
          onOpenModal={() => setIsAgentModalOpen(true)}
          onRefresh={refreshAgents}
        />

        <AgentCreationModal 
          isOpen={isAgentModalOpen} 
          onClose={() => setIsAgentModalOpen(false)} 
          onAgentCreated={handleAgentCreated}
        />
      </div>
    </div>
  );
};

export default Dashboard;

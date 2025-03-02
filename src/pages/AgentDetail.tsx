
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { useAgentDetail } from "@/hooks/useAgentDetail";
import PlaygroundTab from "@/components/agent/PlaygroundTab";
import ActivityTab from "@/components/agent/ActivityTab";
import AnalyticsTab from "@/components/agent/AnalyticsTab";
import SourcesTab from "@/components/agent/SourcesTab";
import SettingsTab from "@/components/agent/SettingsTab";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agent, loading } = useAgentDetail(id || "", user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid grid-cols-6 max-w-3xl">
            <TabsTrigger value="playground" className="text-sm">Playground</TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="sources" className="text-sm">Sources</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
            <TabsTrigger value="connect" className="text-sm" onClick={() => navigate(`/agents/${id}/connect`)}>
              Connect
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playground">
            <PlaygroundTab agentName={agent?.name || "Agent"} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="sources">
            <SourcesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="connect">
            <div className="py-4">
              <Button asChild variant="outline">
                <Link to={`/agents/${id}/connect`}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Open connect page
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDetail;

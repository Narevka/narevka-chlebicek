
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock } from "lucide-react";
import { useAgentSettings } from "@/hooks/useAgentSettings";
import { DeleteAgentDialog } from "./settings/DeleteAgentDialog";

const SettingsTab = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    settings, 
    setSettings, 
    isLoading, 
    isSaving, 
    handleSave 
  } = useAgentSettings(id || "", user?.id);
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-medium mb-6">Agent Settings</h3>
      
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Agent Name
          </label>
          <Input
            id="name"
            value={settings.name}
            onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My AI Assistant"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            value={settings.description}
            onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
            placeholder="A helpful assistant for my website"
          />
          <p className="text-xs text-gray-500">
            A brief description of your agent's purpose.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-medium">
            Instructions
          </label>
          <Textarea
            id="instructions"
            value={settings.instructions}
            onChange={(e) => setSettings(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="You are a helpful AI assistant. Answer questions accurately and concisely."
            rows={6}
          />
          <p className="text-xs text-gray-500">
            Detailed instructions that guide how your agent behaves and responds to users.
            Good instructions lead to better, more consistent responses.
          </p>
        </div>
        
        <div className="space-y-2 border rounded-md p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="is-public" className="text-sm font-medium flex items-center gap-2">
                {settings.isPublic ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                Public Access
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Allow anyone to use this agent without authentication.
              </p>
            </div>
            <Switch
              id="is-public"
              checked={settings.isPublic}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>
          
          {settings.isPublic && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Making this agent public will allow anyone with the link 
                to interact with it without signing in. All usage will count towards your API quota.
              </p>
            </div>
          )}
        </div>
        
        {settings.openaiAssistantId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              OpenAI Assistant ID
            </label>
            <p className="p-2 bg-gray-50 border rounded text-sm text-gray-700 font-mono">
              {settings.openaiAssistantId}
            </p>
            <p className="text-xs text-gray-500">
              This is your agent's OpenAI Assistant ID. It's automatically managed by the system.
            </p>
          </div>
        )}
        
        <div className="flex gap-4 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="mr-auto"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          
          {id && user?.id && (
            <DeleteAgentDialog
              agentId={id}
              userId={user.id}
              openaiAssistantId={settings.openaiAssistantId}
              disabled={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

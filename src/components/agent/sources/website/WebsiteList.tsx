
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteItem } from "./types";
import { useParams } from "react-router-dom";

interface WebsiteListProps {
  websites: WebsiteItem[];
  onWebsitesChanged: () => void;
}

const WebsiteList = ({ websites, onWebsitesChanged }: WebsiteListProps) => {
  const { id: agentId } = useParams<{ id: string }>();

  const handleDeleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from("agent_sources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      onWebsitesChanged();
      toast.success("Website source deleted");
    } catch (error) {
      console.error("Error deleting website source:", error);
      toast.error("Failed to delete website source");
    }
  };

  const handleDeleteAllWebsites = async () => {
    if (!agentId) return;
    
    try {
      const { error } = await supabase
        .from("agent_sources")
        .delete()
        .eq("agent_id", agentId)
        .eq("type", "website");
        
      if (error) throw error;
      
      onWebsitesChanged();
      toast.success("All website sources deleted");
    } catch (error) {
      console.error("Error deleting all website sources:", error);
      toast.error("Failed to delete all website sources");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Included Links</h3>
        {websites.length > 0 && (
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
            onClick={handleDeleteAllWebsites}
          >
            Delete all
          </Button>
        )}
      </div>

      {websites.length === 0 ? (
        <p className="text-gray-500 text-sm">No websites added yet.</p>
      ) : (
        <div className="space-y-2">
          {websites.map((website) => (
            <div 
              key={website.id} 
              className="flex items-center justify-between border rounded-md p-2"
            >
              <div className="flex items-center gap-2">
                <div className={`${website.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs px-2 py-1 rounded-full`}>
                  {website.isProcessed ? 'Trained' : 'Processing'}
                </div>
                <div className="flex flex-col">
                  <span className="truncate max-w-md font-medium">{website.title}</span>
                  <span className="truncate max-w-md text-xs text-gray-500">{website.url}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">{website.chars}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 p-1 h-auto"
                  onClick={() => handleDeleteWebsite(website.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsiteList;

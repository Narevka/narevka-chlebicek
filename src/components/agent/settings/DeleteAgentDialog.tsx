
import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAllAgentConversations } from "../activity/services";

interface DeleteAgentDialogProps {
  agentId: string;
  userId: string;
  openaiAssistantId: string | null;
  disabled?: boolean;
}

export const DeleteAgentDialog = ({ 
  agentId, 
  userId, 
  openaiAssistantId,
  disabled 
}: DeleteAgentDialogProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Step 1: Try to delete the OpenAI assistant if it exists
      if (openaiAssistantId) {
        setDeletionStatus("Attempting to delete OpenAI assistant...");
        try {
          const deleteAssistantResponse = await supabase.functions.invoke('delete-openai-assistant', {
            body: { assistantId: openaiAssistantId }
          });
          
          if (deleteAssistantResponse.error) {
            console.error("Error deleting OpenAI assistant:", deleteAssistantResponse.error);
            // We'll continue with database deletion regardless of this error
            toast.warning("OpenAI Assistant deletion failed, but will continue with database deletion");
          } else {
            const result = deleteAssistantResponse.data;
            if (result.success) {
              console.log("Successfully deleted OpenAI assistant:", openaiAssistantId);
            } else {
              console.warn("OpenAI assistant not found or already deleted:", openaiAssistantId);
              toast.warning("OpenAI Assistant not found or already deleted, continuing with database deletion");
            }
          }
        } catch (error) {
          console.error("Error calling delete-openai-assistant function:", error);
          toast.warning("OpenAI Assistant deletion attempt failed, but will continue with database deletion");
        }
      }
      
      // Step 2: Delete all related conversations and their messages
      setDeletionStatus("Deleting conversations and messages...");
      const conversationsDeleted = await deleteAllAgentConversations(agentId, userId);
      
      if (!conversationsDeleted) {
        toast.warning("Some conversations could not be deleted. Trying to proceed anyway.");
      }
      
      // Step 3: Delete all related sources
      setDeletionStatus("Deleting agent sources...");
      const { error: sourcesDeleteError } = await supabase
        .from("agent_sources")
        .delete()
        .eq("agent_id", agentId);
        
      if (sourcesDeleteError) {
        console.error("Error deleting agent sources:", sourcesDeleteError);
        toast.warning("Failed to delete some agent sources, but will continue with agent deletion");
      }
      
      // Step 4: Finally delete the agent
      setDeletionStatus("Deleting agent...");
      const { error: agentDeleteError } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", userId);
        
      if (agentDeleteError) {
        console.error("Error deleting agent:", agentDeleteError);
        throw new Error(`Failed to delete agent: ${agentDeleteError.message}`);
      }
      
      toast.success("Agent and all related data deleted successfully");
      setOpen(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      toast.error(error.message || "Failed to delete agent");
    } finally {
      setIsDeleting(false);
      setDeletionStatus("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive"
          disabled={disabled || isDeleting}
          className="flex gap-2"
          onClick={() => setOpen(true)}
        >
          <Trash2 size={16} />
          {isDeleting ? "Deleting..." : "Delete Agent"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-destructive/20 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Agent
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="text-gray-700 font-medium mb-2">
              Are you sure you want to delete this agent?
            </p>
            <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm text-gray-700">
              <p>⚠️ This action cannot be undone.</p>
              <p className="mt-1">This will permanently delete:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>The agent from your dashboard</li>
                <li>The associated OpenAI Assistant</li>
                <li>All conversations and messages with this agent</li>
                <li>All agent configurations, settings, and data sources</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 border-t border-gray-100 mt-4">
          {isDeleting && (
            <div className="mr-auto text-sm text-gray-600">
              {deletionStatus}
            </div>
          )}
          <AlertDialogCancel 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white border-0 shadow"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


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

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Step 1: Delete the OpenAI assistant
      setDeletionStatus("Deleting OpenAI assistant...");
      if (openaiAssistantId) {
        const deleteAssistantResponse = await supabase.functions.invoke('delete-openai-assistant', {
          body: { assistantId: openaiAssistantId }
        });
        
        if (deleteAssistantResponse.error) {
          console.error("Error deleting OpenAI assistant:", deleteAssistantResponse.error);
          toast.warning("OpenAI Assistant deletion failed, but will continue with database deletion");
        }
      }
      
      // Step 2: Delete all messages from all conversations related to this agent
      setDeletionStatus("Deleting conversation messages...");
      const { data: relatedConversations, error: conversationsError } = await supabase
        .from("conversations")
        .select("id")
        .eq("agent_id", agentId);
        
      if (conversationsError) {
        console.error("Error fetching related conversations:", conversationsError);
        toast.warning("Failed to fetch related conversations, but will attempt to delete the agent");
      } else if (relatedConversations?.length) {
        // Delete all messages from these conversations
        const conversationIds = relatedConversations.map(conv => conv.id);
        
        const { error: messagesDeleteError } = await supabase
          .from("messages")
          .delete()
          .in("conversation_id", conversationIds);
          
        if (messagesDeleteError) {
          console.error("Error deleting messages:", messagesDeleteError);
          toast.warning("Failed to delete all conversation messages");
        }
        
        // Step 3: Delete all related conversations
        setDeletionStatus("Deleting conversations...");
        const { error: conversationsDeleteError } = await supabase
          .from("conversations")
          .delete()
          .eq("agent_id", agentId);
          
        if (conversationsDeleteError) {
          console.error("Error deleting conversations:", conversationsDeleteError);
          toast.warning("Failed to delete related conversations");
        }
      }
      
      // Step 4: Delete all related sources
      setDeletionStatus("Deleting agent sources...");
      const { error: sourcesDeleteError } = await supabase
        .from("agent_sources")
        .delete()
        .eq("agent_id", agentId);
        
      if (sourcesDeleteError) {
        console.error("Error deleting agent sources:", sourcesDeleteError);
        toast.warning("Failed to delete agent sources");
      }
      
      // Step 5: Finally delete the agent
      setDeletionStatus("Deleting agent...");
      const { error: agentDeleteError } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", userId);
        
      if (agentDeleteError) throw agentDeleteError;
      
      toast.success("Agent and all related data deleted successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      toast.error(error.message || "Failed to delete agent");
      setIsDeleting(false);
      setDeletionStatus("");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive"
          disabled={disabled || isDeleting}
          className="flex gap-2"
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

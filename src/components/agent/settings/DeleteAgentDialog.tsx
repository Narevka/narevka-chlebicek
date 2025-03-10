
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

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      if (openaiAssistantId) {
        const deleteAssistantResponse = await supabase.functions.invoke('delete-openai-assistant', {
          body: { assistantId: openaiAssistantId }
        });
        
        if (deleteAssistantResponse.error) {
          console.error("Error deleting OpenAI assistant:", deleteAssistantResponse.error);
          toast.warning("OpenAI Assistant deletion failed, but will continue with database deletion");
        }
      }
      
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      toast.success("Agent deleted successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      toast.error(error.message || "Failed to delete agent");
      setIsDeleting(false);
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
          <AlertDialogDescription className="pt-2">
            <p className="text-gray-700 font-medium mb-2">
              Are you sure you want to delete this agent?
            </p>
            <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm text-gray-700">
              <p>⚠️ This action cannot be undone.</p>
              <p className="mt-1">This will permanently delete:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>The agent from your dashboard</li>
                <li>The associated OpenAI Assistant</li>
                <li>All agent configurations and settings</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 border-t border-gray-100 mt-4">
          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white border-0 shadow"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

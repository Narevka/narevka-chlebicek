
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMessageFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMessageFeedback = async (
    messageId: string | undefined, 
    type: 'thumbs_up' | 'thumbs_down', 
    value: boolean
  ) => {
    if (!messageId) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(`Updating ${type} to ${value} for message ${messageId}`);
      
      const updateData = type === 'thumbs_up' 
        ? { has_thumbs_up: value } 
        : { has_thumbs_down: value };
      
      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId);
      
      if (error) throw error;
      
      toast.success(`Feedback recorded`);
    } catch (error) {
      console.error(`Error updating message ${type}:`, error);
      toast.error(`Failed to record feedback`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    updateMessageFeedback
  };
};

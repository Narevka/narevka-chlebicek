
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const useAgentDetail = (id: string, userId: string | undefined) => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error("Agent not found");
          navigate("/dashboard");
          return;
        }

        setAgent(data);
      } catch (error: any) {
        console.error("Error fetching agent:", error);
        toast.error(error.message || "Failed to load agent");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, userId, navigate]);

  return { agent, loading };
};

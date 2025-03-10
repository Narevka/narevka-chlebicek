
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Validates and retrieves agent data from Supabase
 * @param agentId The agent ID to look up
 * @returns The agent data including the OpenAI assistant ID
 */
export async function getAgentData(agentId: string): Promise<{ openai_assistant_id: string, name: string }> {
  // Create anonymous Supabase client for public access
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
  );

  console.log(`Looking for agent with ID: ${agentId}`);

  // Get agent data without requiring any authentication
  const { data: agentData, error: agentError } = await supabaseClient
    .from('agents')
    .select('openai_assistant_id, name, is_public')
    .eq('id', agentId)
    .maybeSingle();
  
  if (agentError) {
    console.error("Database error when fetching agent:", agentError);
    throw new Error(`Database error when fetching agent: ${agentError.message}`);
  }
  
  if (!agentData) {
    console.error(`No agent found with ID: ${agentId}`);
    throw new Error(`No agent found with ID: ${agentId}`);
  }

  // Check if agent is public
  if (!agentData.is_public) {
    console.error(`Agent exists but is not public. Agent ID: ${agentId}`);
    throw new Error(`No public agent found with ID: ${agentId}. Make sure the agent is set to public in your dashboard.`);
  }
  
  if (!agentData.openai_assistant_id) {
    console.error(`Agent found but no OpenAI assistant ID is configured. Agent name: ${agentData.name}`);
    throw new Error(`Agent "${agentData.name}" exists but does not have an OpenAI assistant configured.`);
  }

  return agentData;
}

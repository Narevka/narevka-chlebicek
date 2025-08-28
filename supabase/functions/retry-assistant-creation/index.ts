import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Get Supabase client using SERVICE ROLE KEY
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Find all agents without OpenAI Assistant ID
    const { data: agentsWithoutAssistant, error } = await supabaseClient
      .from('agents')
      .select('*')
      .is('openai_assistant_id', null);

    if (error) {
      throw new Error(`Error fetching agents: ${error.message}`);
    }

    if (!agentsWithoutAssistant || agentsWithoutAssistant.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No agents need OpenAI Assistant creation',
          processed: 0
        }),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log(`Found ${agentsWithoutAssistant.length} agents without OpenAI Assistant`);

    const results = [];

    // Process each agent
    for (const agent of agentsWithoutAssistant) {
      try {
        console.log(`Creating OpenAI assistant for agent: ${agent.id} with name: ${agent.name}`);

        // Create OpenAI Assistant
        const openaiResponse = await fetch('https://api.openai.com/v1/assistants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            name: agent.name,
            description: agent.description || `Agent for ${agent.name}`,
            instructions: agent.instructions || "You are a helpful assistant. Answer questions accurately and concisely.",
            model: "gpt-4.1-2025-04-14",
            tools: [] // No tools by default, can be configured later
          })
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error(`OpenAI API error for agent ${agent.id}:`, errorData);
          results.push({
            agentId: agent.id,
            agentName: agent.name,
            success: false,
            error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`
          });
          continue;
        }

        const assistantData = await openaiResponse.json();
        console.log(`Successfully created OpenAI assistant with ID: ${assistantData.id} for agent ${agent.id}`);
        
        // Update the agent with the OpenAI assistant ID
        const { error: updateError } = await supabaseClient
          .from('agents')
          .update({ openai_assistant_id: assistantData.id })
          .eq('id', agent.id);

        if (updateError) {
          console.error(`Error updating agent ${agent.id}:`, updateError);
          results.push({
            agentId: agent.id,
            agentName: agent.name,
            success: false,
            error: `Error updating agent: ${updateError.message}`
          });
          continue;
        }

        console.log(`Updated agent ${agent.id} with OpenAI assistant ID: ${assistantData.id}`);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: true,
          assistantId: assistantData.id
        });

      } catch (error) {
        console.error(`Error processing agent ${agent.id}:`, error);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} agents. ${successCount} successful, ${failureCount} failed.`,
        results: results,
        processed: results.length,
        successful: successCount,
        failed: failureCount
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in retry-assistant-creation:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
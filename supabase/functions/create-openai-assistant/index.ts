
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

    const { agentData } = await req.json();
    
    if (!agentData || !agentData.id || !agentData.name) {
      throw new Error('Invalid agent data provided');
    }

    console.log("Creating OpenAI Assistant for agent:", agentData.id);

    // Create OpenAI Assistant
    const openaiResponse = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        name: agentData.name,
        description: agentData.description || `Agent for ${agentData.name}`,
        instructions: agentData.instructions || "You are a helpful assistant. Answer questions accurately and concisely.",
        model: "gpt-4o-mini",
        tools: [] // No tools by default, can be configured later
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const assistantData = await openaiResponse.json();
    console.log("OpenAI Assistant created successfully:", assistantData.id);
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Update the agent with the OpenAI assistant ID
    const { error: updateError } = await supabaseAdmin
      .from('agents')
      .update({ openai_assistant_id: assistantData.id })
      .eq('id', agentData.id);

    if (updateError) {
      console.error("Error updating agent:", updateError);
      throw new Error(`Error updating agent: ${updateError.message}`);
    }

    console.log("Agent updated with OpenAI Assistant ID successfully");

    return new Response(
      JSON.stringify({
        success: true,
        assistant: assistantData
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error creating OpenAI assistant:", error);
    
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

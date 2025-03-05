
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
    
    // Get Supabase client from request auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Update the agent with the OpenAI assistant ID
    const { error: updateError } = await supabaseClient
      .from('agents')
      .update({ openai_assistant_id: assistantData.id })
      .eq('id', agentData.id);

    if (updateError) {
      console.error("Error updating agent:", updateError);
      throw new Error(`Error updating agent: ${updateError.message}`);
    }

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

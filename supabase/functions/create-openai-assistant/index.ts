
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
      console.error("OpenAI API key not found in environment variables");
      throw new Error('OpenAI API key is not configured');
    }

    console.log("OpenAI API key found, proceeding with agent creation");
    // Mask API key for security but show first and last few chars for debugging
    const maskedKey = OPENAI_API_KEY.substring(0, 4) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4);
    console.log(`Using OpenAI API key starting with ${maskedKey}`);

    const { agentData } = await req.json();
    
    if (!agentData || !agentData.id || !agentData.name) {
      console.error("Invalid agent data:", JSON.stringify(agentData, null, 2));
      throw new Error('Invalid agent data provided');
    }

    console.log("Creating OpenAI Assistant for agent:", agentData.id, "with name:", agentData.name);

    // Create OpenAI Assistant
    console.log("Sending request to OpenAI API");
    const openaiRequestBody = {
      name: agentData.name,
      description: agentData.description || `Agent for ${agentData.name}`,
      instructions: agentData.instructions || "You are a helpful assistant. Answer questions accurately and concisely.",
      model: "gpt-4o-mini",
      tools: [], // No tools by default, can be configured later
      metadata: {
        app_created_by: "lovable_platform",
        agent_id: agentData.id
      }
    };
    console.log("OpenAI request payload:", JSON.stringify(openaiRequestBody, null, 2));

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    };
    console.log("OpenAI request headers:", JSON.stringify({
      'Content-Type': requestHeaders['Content-Type'],
      'Authorization': 'Bearer sk-...', // Mask the actual token
      'OpenAI-Beta': requestHeaders['OpenAI-Beta']
    }, null, 2));

    console.log("Making request to: https://api.openai.com/v1/assistants");
    const openaiResponse = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(openaiRequestBody)
    });

    console.log("OpenAI response status:", openaiResponse.status);
    console.log("OpenAI response headers:", JSON.stringify(Object.fromEntries([...openaiResponse.headers]), null, 2));
    const responseText = await openaiResponse.text();
    console.log("OpenAI raw response:", responseText);

    if (!openaiResponse.ok) {
      console.error("OpenAI API error. Status:", openaiResponse.status);
      console.error("OpenAI API error response:", responseText);
      throw new Error(`OpenAI API error: Status ${openaiResponse.status}, Response: ${responseText}`);
    }

    // Parse JSON after checking it's valid
    let assistantData;
    try {
      assistantData = JSON.parse(responseText);
      console.log("OpenAI Assistant created successfully. ID:", assistantData.id);
      console.log("Assistant details:", JSON.stringify(assistantData, null, 2));
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      throw new Error(`Failed to parse OpenAI response: ${e.message}`);
    }
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing. URL:", !!supabaseUrl, "Service Key:", !!supabaseServiceKey);
      throw new Error('Supabase credentials are not configured');
    }
    
    console.log("Supabase credentials found, creating client");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Update the agent with the OpenAI assistant ID
    console.log("Updating agent", agentData.id, "with OpenAI Assistant ID:", assistantData.id);
    const { error: updateError } = await supabaseAdmin
      .from('agents')
      .update({ openai_assistant_id: assistantData.id })
      .eq('id', agentData.id);

    if (updateError) {
      console.error("Error updating agent:", updateError);
      throw new Error(`Error updating agent: ${updateError.message}`);
    }

    console.log("Agent updated with OpenAI Assistant ID successfully");
    
    // Verify the update was successful
    const { data: updatedAgent, error: getError } = await supabaseAdmin
      .from('agents')
      .select('id, name, openai_assistant_id')
      .eq('id', agentData.id)
      .single();
      
    if (getError) {
      console.error("Error fetching updated agent:", getError);
    } else {
      console.log("Updated agent data:", JSON.stringify(updatedAgent, null, 2));
    }

    return new Response(
      JSON.stringify({
        success: true,
        assistant: assistantData,
        apiKeyUsed: maskedKey,
        openAiApiEndpoint: 'https://api.openai.com/v1/assistants'
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

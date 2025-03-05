
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log("OpenAI API key found, proceeding with assistant update");
    // Mask API key for security but show first and last few chars for debugging
    const maskedKey = OPENAI_API_KEY.substring(0, 4) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4);
    console.log(`Using OpenAI API key starting with ${maskedKey}`);

    const { assistantId, name, description, instructions } = await req.json();
    
    if (!assistantId) {
      console.error("Missing assistantId in request");
      throw new Error('Assistant ID is required');
    }

    console.log("Updating OpenAI Assistant:", assistantId, "with name:", name);

    // Update OpenAI Assistant
    const updatePayload = {
      name: name,
      description: description || undefined,
      instructions: instructions || undefined,
    };
    console.log("OpenAI update payload:", JSON.stringify(updatePayload, null, 2));

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

    console.log(`Making request to: https://api.openai.com/v1/assistants/${assistantId}`);
    const openaiResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(updatePayload)
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

    let assistantData;
    try {
      assistantData = JSON.parse(responseText);
      console.log("OpenAI Assistant updated successfully");
      console.log("Updated assistant details:", JSON.stringify(assistantData, null, 2));
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      throw new Error(`Failed to parse OpenAI response: ${e.message}`);
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
    console.error("Error updating OpenAI assistant:", error);
    
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

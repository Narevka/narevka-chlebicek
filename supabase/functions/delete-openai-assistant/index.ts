
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
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    const { assistantId } = await req.json();
    
    if (!assistantId) {
      console.error('Assistant ID is required but was not provided');
      throw new Error('Assistant ID is required');
    }

    console.log(`Attempting to delete OpenAI assistant with ID: ${assistantId}`);

    // Check if the assistant exists first
    try {
      const checkResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!checkResponse.ok) {
        // If not found (404), return success but with a message
        if (checkResponse.status === 404) {
          console.log(`Assistant ${assistantId} not found in OpenAI (404)`);
          return new Response(
            JSON.stringify({
              success: true,
              message: "Assistant not found in OpenAI, might have been already deleted",
              deleted: false
            }),
            {
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // For other errors, throw
        const errorData = await checkResponse.json();
        throw new Error(`OpenAI API error checking assistant: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error checking if assistant exists:", error);
      // If we can't check, try to delete anyway
    }

    // Delete the OpenAI Assistant
    const openaiResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!openaiResponse.ok) {
      // Handle 404 Not Found in a cleaner way
      if (openaiResponse.status === 404) {
        console.log(`Assistant ${assistantId} not found in OpenAI when attempting deletion (404)`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Assistant not found in OpenAI, might have been already deleted",
            deleted: false
          }),
          {
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // For other errors, handle normally
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error during deletion:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const deletionResult = await openaiResponse.json();
    console.log("OpenAI deletion result:", deletionResult);
    
    // If we got here, the OpenAI deletion was successful
    return new Response(
      JSON.stringify({
        success: true,
        message: "Assistant successfully deleted",
        deleted: true,
        deletionResult
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting OpenAI assistant:", error);
    
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

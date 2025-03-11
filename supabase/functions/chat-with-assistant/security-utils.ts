
/**
 * Security-related utility functions
 */

// CORS configuration for all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Handle errors and return appropriate responses
export function handleError(error: Error): Response {
  console.error("Error in chat-with-assistant function:", error);
  
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

// Validate request body parameters
export function validateRequestBody(body: any): void {
  if (!body.message) {
    throw new Error('Missing required parameter: message is required');
  }

  if (!body.agentId) {
    throw new Error('Missing required parameter: agentId is required');
  }
}

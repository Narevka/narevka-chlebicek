
import { corsHeaders } from "./cors.ts";

/**
 * Handles errors and returns an appropriate response
 * @param error The error that occurred
 * @returns A Response object with the error details
 */
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

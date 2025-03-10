
import { corsHeaders } from './cors.ts'

/**
 * Handles errors from the API
 * @param error The error to handle
 * @returns A formatted Response object
 */
export function handleError(error: any): Response {
  console.error('Error in chat-with-assistant function:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  const statusCode = errorMessage.includes('not found') ? 404 : 500;
  
  return new Response(
    JSON.stringify({ error: errorMessage }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

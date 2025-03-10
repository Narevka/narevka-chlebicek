
import { corsHeaders } from './cors.ts'

/**
 * Handles errors from the API
 * @param error The error to handle
 * @returns A formatted Response object
 */
export function handleError(error: any): Response {
  console.error('Error in chat-with-assistant function:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  
  // Determine status code based on error type
  let statusCode = 500;
  if (errorMessage.includes('not found')) {
    statusCode = 404;
  } else if (errorMessage.includes('invalid_request_error')) {
    statusCode = 400;
  } else if (errorMessage.includes('ThreadNotFound')) {
    statusCode = 404;
  }
  
  // For thread not found errors, include a special flag so frontend can handle it
  const responseBody: any = { error: errorMessage };
  
  if (errorMessage.includes('ThreadNotFound') || 
      errorMessage.includes('Thread not found') || 
      errorMessage.includes('No thread found')) {
    responseBody.threadNotFound = true;
  }
  
  return new Response(
    JSON.stringify(responseBody),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}


import { corsHeaders } from './cors.ts'

/**
 * Handles errors from the API
 * @param error The error to handle
 * @returns A formatted Response object
 */
export function handleError(error: any): Response {
  console.error('[DEBUG] Error in chat-with-assistant function:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  
  // Determine status code based on error type
  let statusCode = 500;
  if (errorMessage.toLowerCase().includes('not found')) {
    statusCode = 404;
    console.log('[DEBUG] Setting status code to 404 for not found error');
  } else if (errorMessage.toLowerCase().includes('invalid_request_error')) {
    statusCode = 400;
    console.log('[DEBUG] Setting status code to 400 for invalid request error');
  } else if (errorMessage.toLowerCase().includes('thread')) {
    statusCode = 404;
    console.log('[DEBUG] Setting status code to 404 for thread-related error');
  }
  
  // For thread not found errors, include a special flag so frontend can handle it
  const responseBody: any = { 
    error: errorMessage,
    debug: {
      originalError: typeof error === 'object' ? JSON.stringify(error) : String(error),
      errorType: error?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString()
    }
  };
  
  // More comprehensive pattern matching for thread errors
  if (errorMessage.toLowerCase().includes('thread') || 
      errorMessage.toLowerCase().includes('not found')) {
    responseBody.threadNotFound = true;
    console.log('[DEBUG] Adding threadNotFound flag to response');
  }
  
  return new Response(
    JSON.stringify(responseBody),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

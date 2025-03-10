
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as openai from './openai.ts'
import { validateRequest } from './validation.ts'
import { corsHeaders } from './cors.ts'
import { handleError } from './error-handler.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { message, agentId, conversationId, source = "Playground", debug = false } = await req.json()
    
    // Enable verbose logging if debug mode is requested
    const log = debug ? 
      (...args: any[]) => console.log('[DEBUG]', ...args) : 
      (...args: any[]) => {};
    
    log("Request received:", { 
      message: message.substring(0, 20) + (message.length > 20 ? '...' : ''),
      agentId, 
      conversationId: conversationId ? `${conversationId.substring(0, 10)}...` : 'null', 
      source
    })

    // Validate request
    validateRequest(message, agentId)

    // Get agent details
    log(`Fetching agent details for ID: ${agentId}`);
    const agentResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&select=*`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      }
    })
    
    const agents = await agentResponse.json()
    if (!agents || agents.length === 0) {
      log(`Agent not found with ID: ${agentId}`);
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    const agent = agents[0]
    log(`Found agent: ${agent.name}`);
    
    // Use the provided conversation ID as thread ID, or generate a new one
    let threadId = conversationId
    
    log(`Using thread ID: ${threadId ? threadId : 'No thread ID provided (will create new)'}`);
    
    try {
      // Get response from the agent
      log("Attempting to get response from OpenAI");
      const { response, confidence, threadId: newThreadId } = await openai.getAgentResponse(agent, message, threadId, debug)
      log(`Got response from agent with threadId: ${newThreadId || 'none'}`)
      
      // Return the response with the thread ID
      return new Response(
        JSON.stringify({ 
          response, 
          threadId: newThreadId, 
          confidence,
          debug: debug ? {
            originalThreadId: threadId,
            newThreadId: newThreadId,
            messageLength: message.length,
            responseLength: response.length,
            timestamp: new Date().toISOString()
          } : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      log("Error getting agent response:", error.message)
      
      // If there's any kind of error, create a new thread ID
      let recoveryThreadId;
      try {
        // Try to create a real OpenAI thread
        log("Creating recovery thread after error");
        recoveryThreadId = await openai.createThread(Deno.env.get('OPENAI_API_KEY') || '');
        log(`Created recovery thread ID: ${recoveryThreadId}`);
      } catch (threadError) {
        // If that fails, just generate a client-side ID
        console.error("Error creating recovery thread:", threadError.message);
        recoveryThreadId = openai.generateId();
        log(`Generated fallback ID: ${recoveryThreadId}`);
      }
      
      // If the error seems to be thread-related, try again with the new thread
      if (error.message?.toLowerCase().includes("thread") || 
          error.message?.toLowerCase().includes("not found")) {
        log("Thread-related error detected, retrying with new thread");
        try {
          const { response, confidence, threadId: finalThreadId } = await openai.getAgentResponse(agent, message, recoveryThreadId, debug)
          log(`Got response from agent with recovery threadId: ${finalThreadId}`)
          
          return new Response(
            JSON.stringify({ 
              response, 
              threadId: finalThreadId, 
              confidence,
              debug: debug ? {
                error: error.message,
                recovery: true,
                originalThreadId: threadId,
                newThreadId: finalThreadId,
                messageLength: message.length,
                responseLength: response.length,
                timestamp: new Date().toISOString()
              } : undefined
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (retryError) {
          // If the retry also fails, fall through to the error handler
          log("Retry with new thread also failed:", retryError.message);
          throw retryError;
        }
      }
      
      // Return a fallback response with the recovery thread ID if we couldn't get a real response
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, I encountered an error processing your request. Please try again.", 
          threadId: recoveryThreadId, 
          confidence: 0.5,
          error: error.message,
          debug: debug ? {
            error: error.message,
            recovery: false,
            originalThreadId: threadId,
            recoveryThreadId: recoveryThreadId,
            timestamp: new Date().toISOString()
          } : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return handleError(error)
  }
})

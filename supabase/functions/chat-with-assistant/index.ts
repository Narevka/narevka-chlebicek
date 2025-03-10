
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
    const { message, agentId, conversationId, source = "Playground" } = await req.json()
    console.log("Request received:", { message, agentId, conversationId, source })

    // Validate request
    validateRequest(message, agentId)

    // Get agent details
    const agentResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&select=*`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      }
    })
    
    const agents = await agentResponse.json()
    if (!agents || agents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    const agent = agents[0]
    
    // Create a new thread ID if one doesn't exist
    let threadId = conversationId
    
    // Always generate a thread ID unless we already have one
    if (!threadId) {
      threadId = openai.generateId() // This will generate a thread_* ID
      console.log(`Created new thread ID: ${threadId}`)
    } else {
      console.log(`Using existing thread ID: ${threadId}`)
    }
    
    try {
      // Get response from the agent
      const { response, confidence } = await openai.getAgentResponse(agent, message, threadId)
      console.log(`Got response from agent with threadId: ${threadId}`)
      
      // Return the response with the properly formatted threadId
      return new Response(
        JSON.stringify({ response, threadId, confidence }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error("Error getting agent response:", error.message)
      
      // If there's an issue with the thread, create a new one and try again
      if (error.message?.includes("No thread found with id")) {
        console.log("Thread ID error detected. Creating a new thread...")
        const newThreadId = openai.generateId()
        console.log(`Created new recovery thread ID: ${newThreadId}`)
        
        const { response, confidence } = await openai.getAgentResponse(agent, message, newThreadId)
        console.log(`Got response from agent with new threadId: ${newThreadId}`)
        
        return new Response(
          JSON.stringify({ response, threadId: newThreadId, confidence }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw error
    }
  } catch (error) {
    return handleError(error)
  }
})

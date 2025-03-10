
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
    
    // Get either existing thread or create a new one
    // Make sure to handle the conversationId format correctly
    let threadId = conversationId
    
    // If we don't have a threadId yet or it doesn't start with "thread_",
    // we'll create a new properly formatted one
    if (!threadId || (typeof threadId === 'string' && !threadId.startsWith('thread_'))) {
      threadId = openai.generateId() // This will generate a thread_* ID
      console.log(`Creating new thread ID: ${threadId}`)
    } else {
      console.log(`Using existing thread ID: ${threadId}`)
    }
    
    // Get response from the agent
    const { response, confidence } = await openai.getAgentResponse(agent, message, threadId)
    
    console.log(`Got response from agent with threadId: ${threadId}`)
    
    // Return the response with the properly formatted threadId
    return new Response(
      JSON.stringify({ response, threadId, confidence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return handleError(error)
  }
})

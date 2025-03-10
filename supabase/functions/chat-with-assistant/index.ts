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
    let threadId = conversationId
    
    // Get response from the agent
    const { response, confidence } = await openai.getAgentResponse(agent, message, threadId)
    
    // Update conversationId if it's new
    if (!threadId) {
      threadId = openai.generateId()
      
      // If we created a new thread, update its source if provided
      if (source && source !== "Playground") {
        console.log(`Updating conversation source to: ${source}`)
        await fetch(`${supabaseUrl}/rest/v1/conversations?id=eq.${threadId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ source: source })
        })
      }
    }
    
    return new Response(
      JSON.stringify({ response, threadId, confidence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return handleError(error)
  }
})

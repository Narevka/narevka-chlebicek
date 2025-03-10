
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
      throw new Error('OpenAI API key is not configured');
    }

    const { message, agentId, conversationId } = await req.json();
    
    if (!message) {
      throw new Error('Missing required parameter: message is required');
    }

    if (!agentId) {
      throw new Error('Missing required parameter: agentId is required');
    }

    // Create anonymous Supabase client for public access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
    );

    console.log(`Looking for agent with ID: ${agentId}`);

    // Get agent data without requiring any authentication
    const { data: agentData, error: agentError } = await supabaseClient
      .from('agents')
      .select('openai_assistant_id, name, is_public')
      .eq('id', agentId)
      .maybeSingle();
    
    if (agentError) {
      console.error("Database error when fetching agent:", agentError);
      throw new Error(`Database error when fetching agent: ${agentError.message}`);
    }
    
    if (!agentData) {
      console.error(`No agent found with ID: ${agentId}`);
      throw new Error(`No agent found with ID: ${agentId}`);
    }

    // Check if agent is public
    if (!agentData.is_public) {
      console.error(`Agent exists but is not public. Agent ID: ${agentId}`);
      throw new Error(`No public agent found with ID: ${agentId}. Make sure the agent is set to public in your dashboard.`);
    }
    
    if (!agentData.openai_assistant_id) {
      console.error(`Agent found but no OpenAI assistant ID is configured. Agent name: ${agentData.name}`);
      throw new Error(`Agent "${agentData.name}" exists but does not have an OpenAI assistant configured.`);
    }

    const assistantId = agentData.openai_assistant_id;
    console.log(`Using OpenAI assistant ID: ${assistantId} for agent: ${agentData.name}`);
    
    // Handle thread management
    let threadId = conversationId;
    
    // If no thread exists, create a new one
    if (!threadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });
      
      if (!threadResponse.ok) {
        const errorData = await threadResponse.json();
        throw new Error(`Failed to create thread: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const threadData = await threadResponse.json();
      threadId = threadData.id;
      
      console.log("Created new thread:", threadId);
    }
    
    // Add user message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });
    
    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      throw new Error(`Failed to add message: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    // Create a run to process the conversation with the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });
    
    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      throw new Error(`Failed to create run: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    
    // Poll for the run completion
    let runStatus = runData.status;
    let assistantResponse = '';
    let pollCount = 0;
    const maxPolls = 30; // Maximum number of polling attempts
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && pollCount < maxPolls) {
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!runCheckResponse.ok) {
        const errorData = await runCheckResponse.json();
        throw new Error(`Failed to check run status: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      pollCount++;
      
      console.log(`Run status (attempt ${pollCount}): ${runStatus}`);
    }
    
    if (runStatus === 'failed') {
      throw new Error('Assistant run failed');
    }
    
    if (pollCount >= maxPolls && runStatus !== 'completed') {
      throw new Error('Timed out waiting for assistant response');
    }
    
    // Retrieve the assistant's messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(`Failed to retrieve messages: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const messagesData = await messagesResponse.json();
    
    if (messagesData.data && messagesData.data.length > 0) {
      const latestMessage = messagesData.data[0];
      if (latestMessage.role === 'assistant' && latestMessage.content.length > 0) {
        assistantResponse = latestMessage.content[0].text.value;
      }
    }

    // Calculate confidence score (mock value for now - in a real implementation this would come from the model)
    const confidence = 0.85 + (Math.random() * 0.1); // Random value between 0.85 and 0.95
    
    return new Response(
      JSON.stringify({
        threadId: threadId,
        response: assistantResponse,
        confidence: confidence
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
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
});


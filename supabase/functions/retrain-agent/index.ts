
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

    const { agentId } = await req.json();
    
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Fetch the agent data to get OpenAI assistant ID
    const { data: agentData, error: agentError } = await supabaseClient
      .from('agents')
      .select('openai_assistant_id, name, description, instructions')
      .eq('id', agentId)
      .single();
      
    if (agentError) {
      throw new Error(`Error fetching agent: ${agentError.message}`);
    }
    
    if (!agentData || !agentData.openai_assistant_id) {
      throw new Error('Agent not found or missing OpenAI assistant ID');
    }

    const assistantId = agentData.openai_assistant_id;
    
    // Get all sources for this agent
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('agent_sources')
      .select('*')
      .eq('agent_id', agentId);
      
    if (sourcesError) {
      throw new Error(`Error fetching sources: ${sourcesError.message}`);
    }

    // Check if vector store exists for this agent
    const vectorStoreName = `vs_${agentId}`;
    let vectorStoreId;

    // Try to get the existing vector store
    const vectorStoreResponse = await fetch('https://api.openai.com/v1/vector_stores', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!vectorStoreResponse.ok) {
      throw new Error(`Error fetching vector stores: ${await vectorStoreResponse.text()}`);
    }

    const vectorStores = await vectorStoreResponse.json();
    
    // Find vector store for this agent
    const existingVectorStore = vectorStores.data.find(vs => vs.name === vectorStoreName);
    
    if (existingVectorStore) {
      vectorStoreId = existingVectorStore.id;
      console.log(`Using existing vector store: ${vectorStoreId}`);
    } else if (sources && sources.length > 0) {
      // If we have sources but no vector store, create one
      const createVectorStoreResponse = await fetch('https://api.openai.com/v1/vector_stores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          name: vectorStoreName,
        })
      });

      if (!createVectorStoreResponse.ok) {
        throw new Error(`Error creating vector store: ${await createVectorStoreResponse.text()}`);
      }

      const vectorStoreData = await createVectorStoreResponse.json();
      vectorStoreId = vectorStoreData.id;
      console.log(`Created new vector store: ${vectorStoreId}`);
    }

    // Update the assistant with the latest information
    const updateData: any = {
      name: agentData.name,
    };
    
    if (agentData.description) {
      updateData.description = agentData.description;
    }
    
    if (agentData.instructions) {
      updateData.instructions = agentData.instructions;
    }
    
    // Set tools - always include file_search if we have sources
    updateData.tools = [];
    
    if (sources && sources.length > 0 && vectorStoreId) {
      updateData.tools.push({ 
        type: "file_search" 
      });
      
      updateData.tool_resources = {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      };
    }

    console.log(`Updating assistant with: ${JSON.stringify(updateData)}`);
    
    // Update the assistant
    const updateAssistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateAssistantResponse.ok) {
      throw new Error(`Error updating assistant: ${await updateAssistantResponse.text()}`);
    }
    
    const assistantResponse = await updateAssistantResponse.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Agent retrained successfully",
        assistant: assistantResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error retraining agent:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

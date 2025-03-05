
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

    const { sourceId, agentId, operation } = await req.json();
    
    if (!sourceId || !agentId) {
      throw new Error('Source ID and Agent ID are required');
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

    // Fetch the source data
    const { data: sourceData, error: sourceError } = await supabaseClient
      .from('agent_sources')
      .select('*')
      .eq('id', sourceId)
      .single();
      
    if (sourceError) {
      throw new Error(`Error fetching source: ${sourceError.message}`);
    }
    
    if (!sourceData) {
      throw new Error('Source not found');
    }

    // Fetch the agent data to get OpenAI assistant ID
    const { data: agentData, error: agentError } = await supabaseClient
      .from('agents')
      .select('openai_assistant_id')
      .eq('id', agentId)
      .single();
      
    if (agentError) {
      throw new Error(`Error fetching agent: ${agentError.message}`);
    }
    
    if (!agentData || !agentData.openai_assistant_id) {
      throw new Error('Agent not found or missing OpenAI assistant ID');
    }

    const assistantId = agentData.openai_assistant_id;
    let result;

    // Check if the vector store exists for this agent
    let vectorStoreId;
    const vectorStoreName = `vs_${agentId}`;

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
    
    // Find or create vector store for this agent
    const existingVectorStore = vectorStores.data.find(vs => vs.name === vectorStoreName);
    
    if (existingVectorStore) {
      vectorStoreId = existingVectorStore.id;
      console.log(`Using existing vector store: ${vectorStoreId}`);
    } else {
      // Create a new vector store for this agent
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

    // Based on source type, handle differently
    if (sourceData.type === 'text') {
      console.log(`Processing text source: ${sourceId}`);
      
      // For text sources, we need to create a file first
      const fileName = `text_${new Date().toISOString()}.txt`;
      const fileContent = sourceData.content;
      
      // Create a file with OpenAI
      const formData = new FormData();
      formData.append('purpose', 'assistants');
      formData.append('file', new Blob([fileContent], { type: 'text/plain' }), fileName);
      
      const fileResponse = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          // Note: Content-Type is set automatically by FormData
        },
        body: formData
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Error uploading file to OpenAI: ${await fileResponse.text()}`);
      }
      
      const fileData = await fileResponse.json();
      const fileId = fileData.id;
      console.log(`Created file in OpenAI: ${fileId}`);
      
      // Add the file to the vector store
      const addToVectorStoreResponse = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          file_id: fileId
        })
      });
      
      if (!addToVectorStoreResponse.ok) {
        throw new Error(`Error adding file to vector store: ${await addToVectorStoreResponse.text()}`);
      }
      
      const addToVectorStoreData = await addToVectorStoreResponse.json();
      console.log(`Added file to vector store: ${JSON.stringify(addToVectorStoreData)}`);
      
      result = addToVectorStoreData;
      
    } else if (sourceData.type === 'file') {
      console.log(`Processing file source: ${sourceId}`);
      // For this demo, we'll just log as we can't actually upload the file 
      // since we're just storing the filename in our database
      console.log(`File processing would happen here for file: ${sourceData.content}`);
      
      result = { 
        status: "success", 
        message: "File processing simulation successful",
        note: "In a real implementation, we would upload the actual file to OpenAI" 
      };
    } else {
      throw new Error(`Unsupported source type: ${sourceData.type}`);
    }

    // Attach the vector store to the assistant
    const updateAssistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId]
          }
        }
      })
    });
    
    if (!updateAssistantResponse.ok) {
      throw new Error(`Error updating assistant: ${await updateAssistantResponse.text()}`);
    }
    
    const assistantData = await updateAssistantResponse.json();
    console.log(`Updated assistant with vector store: ${JSON.stringify(assistantData.tool_resources)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Source processed successfully",
        vectorStoreId,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing agent source:", error);
    
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

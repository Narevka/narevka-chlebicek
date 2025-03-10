
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "./cors.ts";
import { 
  createThread, 
  addMessageToThread, 
  createRun, 
  pollForRunCompletion, 
  getLatestAssistantMessage,
  getAgentData
} from "./openai.ts";
import { handleError } from "./error-handler.ts";
import { validateRequestBody } from "./validation.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { 
      message, 
      agentId, 
      conversationId, 
      dbConversationId, 
      userId = 'anonymous-user' 
    } = await req.json();
    
    // Validate request body
    validateRequestBody({ message, agentId });
    
    console.log(`Processing message for agent: ${agentId}, userId: ${userId}`);

    // Get agent data from Supabase
    const agentData = await getAgentData(agentId);
    const assistantId = agentData.openai_assistant_id;
    
    console.log(`Using OpenAI assistant ID: ${assistantId} for agent: ${agentData.name}`);
    
    // Get auth token from request (if it exists)
    const authHeader = req.headers.get('Authorization');
    let supabaseClient;
    
    try {
      // Initialize Supabase client for database operations
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Missing Supabase credentials, database operations will be skipped');
      } else {
        // Create client with auth header if it exists
        const options = authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined;
        supabaseClient = createClient(supabaseUrl, supabaseKey, options);
        console.log('Supabase client initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      // Continue without database operations
    }
    
    // Handle thread management
    let threadId = conversationId;
    
    // If no thread exists, create a new one
    if (!threadId) {
      threadId = await createThread(OPENAI_API_KEY);
    }
    
    // Handle conversation tracking in database
    let conversationDbId = dbConversationId;
    
    // Create new database conversation if none exists and we have a user ID and Supabase
    if (!conversationDbId && userId && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('conversations')
          .insert({
            user_id: userId,
            title: 'Embedded Chat',
            source: 'embedded'
          })
          .select('id')
          .single();
        
        if (error) throw error;
        conversationDbId = data.id;
        console.log(`Created new conversation in database with ID: ${conversationDbId}`);
      } catch (error) {
        console.error('Error creating conversation in database:', error);
        // Continue without database operations
      }
    }
    
    // Save user message to database if we have a conversation ID and Supabase
    if (conversationDbId && supabaseClient) {
      try {
        await supabaseClient
          .from('messages')
          .insert({
            conversation_id: conversationDbId,
            content: message,
            is_bot: false
          });
        console.log('Saved user message to database');
      } catch (error) {
        console.error('Error saving user message to database:', error);
        // Continue without database operations
      }
    }
    
    // Add user message to the thread
    await addMessageToThread(OPENAI_API_KEY, threadId, message);
    
    // Create a run to process the conversation with the assistant
    const { runId, status } = await createRun(OPENAI_API_KEY, threadId, assistantId);
    
    // Poll for the run completion
    await pollForRunCompletion(OPENAI_API_KEY, threadId, runId, status);
    
    // Retrieve the assistant's messages
    const assistantResponse = await getLatestAssistantMessage(OPENAI_API_KEY, threadId);

    // Calculate confidence score (mock value for now - in a real implementation this would come from the model)
    const confidence = 0.85 + (Math.random() * 0.1); // Random value between 0.85 and 0.95
    
    // Save bot message to database if we have a conversation ID and Supabase
    if (conversationDbId && supabaseClient) {
      try {
        await supabaseClient
          .from('messages')
          .insert({
            conversation_id: conversationDbId,
            content: assistantResponse,
            is_bot: true,
            confidence: confidence
          });
        console.log('Saved bot message to database');
      } catch (error) {
        console.error('Error saving bot message to database:', error);
        // Continue without database operations
      }
    }
    
    return new Response(
      JSON.stringify({
        threadId: threadId,
        dbConversationId: conversationDbId,
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
    return handleError(error);
  }
});

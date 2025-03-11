
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

  // Declare variables at the function scope so they're available everywhere
  let supabaseClient = null;
  let threadId = '';
  let finalConversationId = '';
  let finalConversationDbId = '';
  
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { 
      message, 
      agentId, 
      conversationId: inputConversationId, 
      dbConversationId: inputDbConversationId, 
      userId,
      source = 'Playground'  // Default source if none provided
    } = await req.json();
    
    // Validate and normalize the source
    const normalizedSource = source?.toLowerCase().includes('embed') 
      ? 'embedded' 
      : (source || 'Playground');
    
    console.log(`Processing message for agent: ${agentId}, source: ${normalizedSource}`);
    
    // Set conversation variables from input
    finalConversationId = inputConversationId || '';
    finalConversationDbId = inputDbConversationId || '';
    
    // Generate valid UUID for anonymous users if none provided
    const userIdentifier = userId || crypto.randomUUID();
    
    // Validate request body
    validateRequestBody({ message, agentId });

    // Get agent data from Supabase
    const agentData = await getAgentData(agentId);
    const assistantId = agentData.openai_assistant_id;
    
    console.log(`Using OpenAI assistant ID: ${assistantId} for agent: ${agentData.name}`);
    
    // Initialize Supabase client using SERVICE ROLE KEY for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase credentials, database operations will be skipped');
    } else {
      // Important: When using service role key, disable auth auto refresh and session persistence
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('Supabase admin client initialized successfully');
    }
    
    // Handle thread management
    threadId = finalConversationId;
    
    // If no thread exists, create a new one
    if (!threadId) {
      threadId = await createThread(OPENAI_API_KEY);
    }
    
    // Create new database conversation if none exists and Supabase is initialized
    if (!finalConversationDbId && supabaseClient) {
      try {
        // Generate a conversation ID if not provided
        const generatedConversationId = crypto.randomUUID();
        
        // Now insert the conversation with user ID (or null for embedded chats)
        const { data, error } = await supabaseClient
          .from('conversations')
          .insert({
            id: generatedConversationId,
            user_id: userId, // This can be null for embedded chats
            title: 'New Conversation',
            source: normalizedSource,
            metadata: { 
              anonymous_id: userIdentifier,
              timestamp: new Date().toISOString(),
              thread_id: threadId // Store OpenAI thread ID in metadata
            }
          })
          .select('id')
          .single();
        
        if (error) throw error;
        finalConversationDbId = data.id;
        console.log(`Created new conversation in database with ID: ${finalConversationDbId}, source: ${normalizedSource}`);
      } catch (error) {
        console.error('Error creating conversation in database:', error);
      }
    }
    
    // Save user message to database if we have a conversation ID and Supabase
    if (finalConversationDbId && supabaseClient) {
      try {
        await supabaseClient
          .from('messages')
          .insert({
            conversation_id: finalConversationDbId,
            content: message,
            is_bot: false
          });
        console.log('Saved user message to database');
      } catch (error) {
        console.error('Error saving user message to database:', error);
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
    if (finalConversationDbId && supabaseClient) {
      try {
        await supabaseClient
          .from('messages')
          .insert({
            conversation_id: finalConversationDbId,
            content: assistantResponse,
            is_bot: true,
            confidence: confidence
          });
        console.log('Saved bot message to database');
      } catch (error) {
        console.error('Error saving bot message to database:', error);
      }
    }
    
    return new Response(
      JSON.stringify({
        threadId: threadId,
        dbConversationId: finalConversationDbId,
        response: assistantResponse,
        confidence: confidence,
        source: normalizedSource // Return the normalized source to client
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

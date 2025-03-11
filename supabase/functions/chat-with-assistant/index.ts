
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
      userId 
    } = await req.json();
    
    // Generate valid UUID for anonymous users if none provided
    const userIdentifier = userId || crypto.randomUUID();
    
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
      // Extract request origins for security and tracking
      let origin = req.headers.get('Origin') || '';
      let referer = req.headers.get('Referer') || '';
      let refererDomain = '';
      
      // You can add more allowed domains as needed
      const allowedOrigins = [
        'https://www.narevka.com', 
        'https://narevka.com',
        'http://localhost:3000',
        'http://localhost:4000'
      ];
      
      // Extract domain from referer as fallback for origin check
      try {
        if (referer) {
          const url = new URL(referer);
          refererDomain = url.origin;
        }
      } catch (e) {
        console.warn('Could not parse referer URL');
      }
      
      // Verify request origin for extra security
      const isAllowedOrigin = allowedOrigins.some(allowed => 
        origin.includes(allowed) || refererDomain.includes(allowed)
      );
      
      if (!isAllowedOrigin && origin && origin !== 'null') {
        console.warn(`Request from unauthorized origin: ${origin}, referer: ${referer}`);
      }
      
      // Initialize Supabase client using SERVICE ROLE KEY for database operations
      // This bypasses RLS policies and allows full database access
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
    
    // Create new database conversation if none exists and Supabase is initialized
    if (!conversationDbId && supabaseClient) {
      try {
        // Generate a conversation ID if not provided
        const generatedConversationId = crypto.randomUUID();
        
        // After schema modification, we can use NULL for user_id in embedded chats
        // This is more correct than using a dummy user
        const userIdForEmbeddedChat = null; // Use NULL for embedded chats
        
        // Now insert the conversation with our special user ID
        const { data, error } = await supabaseClient
          .from('conversations')
          .insert({
            id: generatedConversationId,
            user_id: userIdForEmbeddedChat, // Use NULL as user_id
            title: 'Embedded Chat',
            source: 'embedded',
            metadata: { 
              anonymous_id: userIdentifier,
              timestamp: new Date().toISOString(),
              origin: origin || refererDomain || 'unknown'
            } // Store additional information in metadata
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

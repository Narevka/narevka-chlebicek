
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { handleCors, corsHeaders, handleError, validateRequestBody } from "./security-utils.ts";
import { detectLanguage, getLanguageInstructions } from "./language-utils.ts";
import { createDatabaseConversation, saveMessageToDatabase, extractSourceFromReferer, verifyRequestOrigin } from "./conversation-manager.ts";
import { 
  createThread, 
  addMessageToThread, 
  createRun, 
  pollForRunCompletion, 
  getLatestAssistantMessage,
  getAgentData
} from "./openai.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  // Declare variables at the function scope so they're available everywhere
  let origin = '';
  let referer = '';
  let refererDomain = '';
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
      language: requestLanguage // Optional language parameter
    } = await req.json();
    
    console.log(`Processing request with agentId: ${agentId}, userId: ${userId || 'anonymous'}`);
    
    // Detect language from headers or use provided language
    const userLanguage = requestLanguage || detectLanguage(req);
    console.log(`Detected/provided language: ${userLanguage}`);
    
    // Set conversation variables from input
    finalConversationId = inputConversationId || '';
    finalConversationDbId = inputDbConversationId || '';
    
    // Generate valid UUID for anonymous users if none provided
    const userIdentifier = userId || crypto.randomUUID();
    
    // Validate request body
    validateRequestBody({ message, agentId });
    
    console.log(`Processing message for agent: ${agentId}, userId: ${userId}, language: ${userLanguage}`);

    // Get agent data from Supabase
    const agentData = await getAgentData(agentId);
    const assistantId = agentData.openai_assistant_id;
    
    console.log(`Using OpenAI assistant ID: ${assistantId} for agent: ${agentData.name}`);
    
    // Extract request origins for security and tracking
    origin = req.headers.get('Origin') || '';
    referer = req.headers.get('Referer') || '';
    
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
    const isAllowedOrigin = verifyRequestOrigin(origin, refererDomain);
    
    if (!isAllowedOrigin && origin && origin !== 'null') {
      console.warn(`Request from unauthorized origin: ${origin}, referer: ${referer}`);
    }
    
    // Initialize Supabase client using SERVICE ROLE KEY for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase credentials, database operations will be skipped');
    } else {
      // Initialize with service role key, disable auth auto refresh and session persistence
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
      // Extract source from referrer
      const conversationSource = extractSourceFromReferer(referer);
      
      // Create conversation in database - pass the agentId to the function
      finalConversationDbId = await createDatabaseConversation(
        supabaseClient,
        userIdentifier,
        conversationSource,
        origin,
        referer,
        userLanguage,
        agentId
      );
    }
    
    // Save user message to database
    if (finalConversationDbId && supabaseClient) {
      await saveMessageToDatabase(
        supabaseClient,
        finalConversationDbId,
        message,
        false,
        undefined,
        userLanguage
      );
    }
    
    // Add user message to the thread
    await addMessageToThread(OPENAI_API_KEY, threadId, message);
    
    // Add language instructions for the OpenAI model
    const systemInstructions = getLanguageInstructions(userLanguage);
    
    // Create a run to process the conversation with the assistant
    const { runId, status } = await createRun(
      OPENAI_API_KEY, 
      threadId, 
      assistantId,
      systemInstructions ? { instructions: systemInstructions } : undefined
    );
    
    // Poll for the run completion
    await pollForRunCompletion(OPENAI_API_KEY, threadId, runId, status);
    
    // Retrieve the assistant's messages
    const assistantResponse = await getLatestAssistantMessage(OPENAI_API_KEY, threadId);

    // Calculate confidence score (mock value for now)
    const confidence = 0.85 + (Math.random() * 0.1); // Random value between 0.85 and 0.95
    
    // Save bot message to database
    if (finalConversationDbId && supabaseClient) {
      await saveMessageToDatabase(
        supabaseClient,
        finalConversationDbId,
        assistantResponse,
        true,
        confidence,
        userLanguage
      );
    }
    
    return new Response(
      JSON.stringify({
        threadId: threadId,
        dbConversationId: finalConversationDbId,
        response: assistantResponse,
        confidence: confidence,
        language: userLanguage // Include language information in the response
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

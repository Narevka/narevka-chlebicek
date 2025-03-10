import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "./cors.ts";

/**
 * Creates a thread for the OpenAI assistant
 * @param apiKey OpenAI API key
 * @returns The thread ID
 */
export async function createThread(apiKey: string): Promise<string> {
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });
  
  if (!threadResponse.ok) {
    const errorData = await threadResponse.json();
    throw new Error(`Failed to create thread: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const threadData = await threadResponse.json();
  const threadId = threadData.id;
  
  console.log("Created new thread:", threadId);
  return threadId;
}

/**
 * Adds a user message to the thread
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @param message The message to add
 */
export async function addMessageToThread(apiKey: string, threadId: string, message: string): Promise<void> {
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
}

/**
 * Creates a run with the assistant
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @param assistantId The assistant ID
 * @returns The run ID and initial status
 */
export async function createRun(apiKey: string, threadId: string, assistantId: string): Promise<{ runId: string, status: string }> {
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
  return { runId: runData.id, status: runData.status };
}

/**
 * Polls for the run completion
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @param runId The run ID
 * @param initialStatus The initial status of the run
 * @returns The final status of the run
 */
export async function pollForRunCompletion(apiKey: string, threadId: string, runId: string, initialStatus: string): Promise<string> {
  let runStatus = initialStatus;
  let pollCount = 0;
  const maxPolls = 30; // Maximum number of polling attempts
  
  while (runStatus !== 'completed' && runStatus !== 'failed' && pollCount < maxPolls) {
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
  
  return runStatus;
}

/**
 * Retrieves the latest assistant message
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @returns The message content
 */
export async function getLatestAssistantMessage(apiKey: string, threadId: string): Promise<string> {
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
      return latestMessage.content[0].text.value;
    }
  }
  
  return '';
}

/**
 * Validates and retrieves agent data from Supabase
 * @param agentId The agent ID to look up
 * @returns The agent data including the OpenAI assistant ID
 */
export async function getAgentData(agentId: string): Promise<{ openai_assistant_id: string, name: string }> {
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

  return agentData;
}

/**
 * Generates a unique ID for a thread
 * @returns A unique ID string
 */
export function generateId(): string {
  // Generate a random UUID-like string
  return crypto.randomUUID();
}

/**
 * Gets a response from the agent using OpenAI's assistant
 * @param agent The agent data
 * @param message The user message
 * @param threadId Optional thread ID for continuing a conversation
 * @returns The response and confidence level
 */
export async function getAgentResponse(agent: any, message: string, threadId?: string | null): Promise<{ response: string, confidence: number }> {
  // Get the OpenAI API key from environment variables
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }

  console.log(`Processing request for agent: ${agent.name} (${agent.id})`);
  
  // Validate and get the OpenAI assistant ID
  const assistantId = agent.openai_assistant_id;
  if (!assistantId) {
    throw new Error(`No OpenAI assistant ID configured for agent ${agent.name}`);
  }
  
  try {
    // Create a new thread if none was provided
    const actualThreadId = threadId || await createThread(openAIApiKey);
    console.log(`Using thread ID: ${actualThreadId}`);
    
    // Add the user message to the thread
    await addMessageToThread(openAIApiKey, actualThreadId, message);
    
    // Create a run with the assistant
    const { runId, status: initialStatus } = await createRun(openAIApiKey, actualThreadId, assistantId);
    console.log(`Created run with ID: ${runId}, initial status: ${initialStatus}`);
    
    // Poll for the run completion
    const finalStatus = await pollForRunCompletion(openAIApiKey, actualThreadId, runId, initialStatus);
    console.log(`Run completed with status: ${finalStatus}`);
    
    // Get the latest assistant message
    const response = await getLatestAssistantMessage(openAIApiKey, actualThreadId);
    console.log(`Retrieved response of length: ${response.length}`);
    
    // Return the response with a default confidence level
    // In a real implementation, you might want to get this from the OpenAI API or calculate it somehow
    return {
      response,
      confidence: 0.95  // Default confidence level
    };
  } catch (error) {
    console.error(`Error getting response from OpenAI: ${error.message}`);
    throw error;
  }
}

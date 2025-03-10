
import { createThread, generateId } from "./libs/threadManager.ts";
import { addMessageToThread, getLatestAssistantMessage } from "./libs/messageHandler.ts";
import { createRun, pollForRunCompletion } from "./libs/assistantRunner.ts";
import { getAgentData } from "./libs/agentService.ts";

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
    let actualThreadId: string;
    
    // Always create a new thread if no threadId is provided
    if (!threadId) {
      console.log("No threadId provided, creating a new thread");
      actualThreadId = await createThread(openAIApiKey);
      console.log(`Created new thread: ${actualThreadId}`);
    } else {
      console.log(`Using existing thread: ${threadId}`);
      actualThreadId = threadId;
    }
    
    // Add the user message to the thread
    try {
      await addMessageToThread(openAIApiKey, actualThreadId, message);
    } catch (error: any) {
      console.error(`Error adding message to thread: ${error.message}`);
      
      // If there's an error with the thread ID, create a new thread and try again
      if (error.message?.includes("No thread found with id")) {
        console.log("Thread not found, creating a new thread and retrying");
        actualThreadId = await createThread(openAIApiKey);
        console.log(`Created new thread after error: ${actualThreadId}`);
        await addMessageToThread(openAIApiKey, actualThreadId, message);
      } else {
        throw error;
      }
    }
    
    // Create a run with the assistant
    const { runId, status: initialStatus } = await createRun(openAIApiKey, actualThreadId, assistantId);
    console.log(`Created run with ID: ${runId}, initial status: ${initialStatus}`);
    
    // Poll for the run completion
    const finalStatus = await pollForRunCompletion(openAIApiKey, actualThreadId, runId, initialStatus);
    console.log(`Run completed with status: ${finalStatus}`);
    
    // Get the latest assistant message
    const response = await getLatestAssistantMessage(openAIApiKey, actualThreadId);
    console.log(`Retrieved response of length: ${response.length}`);
    
    // Return the response with the new thread ID
    return {
      response,
      confidence: 0.95  // Default confidence level
    };
  } catch (error) {
    console.error(`Error getting response from OpenAI: ${error.message}`);
    throw error;
  }
}

// Export the functions from the modules for backward compatibility
export { createThread, generateId } from "./libs/threadManager.ts";
export { getAgentData } from "./libs/agentService.ts";

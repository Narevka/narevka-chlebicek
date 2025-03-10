
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
export async function getAgentResponse(agent: any, message: string, threadId?: string | null): Promise<{ response: string, confidence: number, threadId: string }> {
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
    let created_new_thread = false;
    
    // Always create a new thread if one wasn't provided
    if (!threadId) {
      console.log("No threadId provided, creating a new thread");
      actualThreadId = await createThread(openAIApiKey);
      created_new_thread = true;
      console.log(`Created new thread: ${actualThreadId}`);
    } else {
      console.log(`Attempting to use existing thread: ${threadId}`);
      actualThreadId = threadId;
    }
    
    // Try to add the message to the thread
    try {
      await addMessageToThread(openAIApiKey, actualThreadId, message);
      console.log(`Message added to thread ${actualThreadId}`);
    } catch (error) {
      // If there's a thread not found error, create a new thread immediately
      if (error.message && error.message.includes("ThreadNotFound:")) {
        console.log(`Thread ${actualThreadId} not found, creating a new one`);
        actualThreadId = await createThread(openAIApiKey);
        created_new_thread = true;
        console.log(`Created new recovery thread: ${actualThreadId}`);
        
        // Try adding the message to the new thread
        await addMessageToThread(openAIApiKey, actualThreadId, message);
        console.log(`Message added to new thread ${actualThreadId}`);
      } else {
        // If it's not a thread not found error, rethrow
        throw error;
      }
    }
    
    // Create a run with the assistant
    console.log(`Creating run with assistant ${assistantId}`);
    const { runId, status: initialStatus } = await createRun(openAIApiKey, actualThreadId, assistantId);
    console.log(`Created run with ID: ${runId}, initial status: ${initialStatus}`);
    
    // Poll for the run completion
    console.log(`Polling for run completion, initial status: ${initialStatus}`);
    const finalStatus = await pollForRunCompletion(openAIApiKey, actualThreadId, runId, initialStatus);
    console.log(`Run completed with status: ${finalStatus}`);
    
    // Get the latest assistant message
    let response;
    try {
      console.log(`Getting latest assistant message from thread ${actualThreadId}`);
      response = await getLatestAssistantMessage(openAIApiKey, actualThreadId);
      console.log(`Retrieved response of length: ${response.length}`);
    } catch (error) {
      // If there's a thread not found error when getting the message, create a new thread and return a fallback
      if (error.message && error.message.includes("ThreadNotFound:")) {
        console.error(`Thread ${actualThreadId} not found when getting assistant message`);
        const newThreadId = await createThread(openAIApiKey);
        created_new_thread = true;
        return {
          response: "I'm sorry, there was an error retrieving the response. Please try again.",
          confidence: 0.5,
          threadId: newThreadId
        };
      }
      throw error;
    }
    
    // Return the response with the thread ID
    return {
      response,
      confidence: created_new_thread ? 0.85 : 0.95, // Slightly lower confidence if we created a new thread
      threadId: actualThreadId
    };
  } catch (error) {
    console.error(`Error getting response from OpenAI: ${error.message}`);
    
    // If there's any other error, create a new thread for the next interaction
    let newThreadId;
    try {
      newThreadId = await createThread(openAIApiKey);
      console.log(`Created new thread after error: ${newThreadId}`);
    } catch (threadError) {
      console.error(`Error creating new thread: ${threadError.message}`);
      newThreadId = generateId(); // Fallback to generating an ID without actually creating a thread
    }
    
    throw error;
  }
}

// Export the functions from the modules for backward compatibility
export { createThread, generateId } from "./libs/threadManager.ts";
export { getAgentData } from "./libs/agentService.ts";

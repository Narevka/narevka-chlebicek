
import { corsHeaders } from '../cors.ts';

/**
 * Creates a thread for the OpenAI assistant
 * @param apiKey OpenAI API key
 * @returns The thread ID
 */
export async function createThread(apiKey: string): Promise<string> {
  console.log("Creating new OpenAI thread");
  
  try {
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
      console.error("Failed to create thread:", errorData);
      throw new Error(`Failed to create thread: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const threadData = await threadResponse.json();
    const threadId = threadData.id;
    
    console.log("Created new thread:", threadId);
    return threadId;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

/**
 * Generates a unique ID for conversations
 * @returns A unique string ID prefixed with 'thread_'
 */
export function generateId(): string {
  // Create a thread ID that starts with 'thread_' to ensure proper format
  return `thread_${crypto.randomUUID()}`;
}

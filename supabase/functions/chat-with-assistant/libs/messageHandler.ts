
/**
 * Adds a user message to the thread
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @param message The message to add
 * @returns A promise that resolves when the message is added or rejects with an error
 */
export async function addMessageToThread(apiKey: string, threadId: string, message: string): Promise<void> {
  console.log(`Adding message to thread ${threadId}`);
  
  try {
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
      console.error("Failed to add message:", errorData);
      
      // Check if the error is related to the thread not being found
      if (errorData.error?.message?.includes("No thread found with id")) {
        throw new Error(`ThreadNotFound: ${threadId}`);
      }
      
      throw new Error(`Failed to add message: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    console.log("Message added successfully");
  } catch (error) {
    console.error("Error adding message to thread:", error);
    
    // Rethrow with a clear error type if it's a thread not found error
    if (error.message?.includes("No thread found") || error.message?.includes("ThreadNotFound:")) {
      throw new Error(`ThreadNotFound: ${threadId}`);
    }
    
    throw error;
  }
}

/**
 * Retrieves the latest assistant message
 * @param apiKey OpenAI API key
 * @param threadId The thread ID
 * @returns The message content
 */
export async function getLatestAssistantMessage(apiKey: string, threadId: string): Promise<string> {
  console.log(`Getting latest message from thread ${threadId}`);
  
  try {
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Failed to retrieve messages:", errorData);
      
      // Check if the error is related to the thread not being found
      if (errorData.error?.message?.includes("No thread found with id")) {
        throw new Error(`ThreadNotFound: ${threadId}`);
      }
      
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
  } catch (error) {
    console.error("Error retrieving messages:", error);
    
    // Rethrow with a clear error type if it's a thread not found error
    if (error.message?.includes("No thread found") || error.message?.includes("ThreadNotFound:")) {
      throw new Error(`ThreadNotFound: ${threadId}`);
    }
    
    throw error;
  }
}

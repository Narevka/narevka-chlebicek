
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

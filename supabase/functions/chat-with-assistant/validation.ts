
/**
 * Validates the request body
 * @param message The message to validate
 * @param agentId The agent ID to validate
 * @throws Error if validation fails
 */
export function validateRequest(message: string, agentId: string): void {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Missing required parameter: message is required');
  }

  if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') {
    throw new Error('Missing required parameter: agentId is required');
  }
}

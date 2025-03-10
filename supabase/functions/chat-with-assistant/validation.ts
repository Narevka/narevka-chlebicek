
/**
 * Validates the request body
 * @param body The request body to validate
 * @throws Error if validation fails
 */
export function validateRequestBody(body: any): void {
  if (!body.message) {
    throw new Error('Missing required parameter: message is required');
  }

  if (!body.agentId) {
    throw new Error('Missing required parameter: agentId is required');
  }
}

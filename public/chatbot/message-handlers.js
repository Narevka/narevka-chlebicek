
// Imports from debug-utils.js
import { logToDebugPanel, logDebug } from './debug-utils.js';

export function addMessage(text, isUser, debugInfo) {
  const messagesContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageElement.textContent = text;
  messagesContainer.appendChild(messageElement);
  
  if (debugInfo) {
    const debugEl = document.createElement('div');
    debugEl.className = 'debug-info';
    if (localStorage.getItem('chatbot_debug_mode') === 'true') {
      debugEl.classList.add('show-debug');
    }
    debugEl.textContent = debugInfo;
    messageElement.appendChild(debugEl);
  }
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return messageElement;
}

export function addLoadingIndicator() {
  const messagesContainer = document.getElementById('messages');
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = 'AI is thinking<div class="loading-dots"><span></span><span></span><span></span></div>';
  loadingIndicator.id = 'loading-indicator';
  messagesContainer.appendChild(loadingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return loadingIndicator;
}

export function removeLoadingIndicator() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.remove();
  }
}

export function showError(errorMessage, details) {
  removeLoadingIndicator();
  const messagesContainer = document.getElementById('messages');
  
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-container';
  
  // Add a user-friendly message
  const userMessage = document.createElement('div');
  userMessage.textContent = errorMessage || "Sorry, I couldn't respond to your message.";
  errorContainer.appendChild(userMessage);

  // Add a retry button
  const retryButton = document.createElement('button');
  retryButton.className = 'retry-button';
  retryButton.textContent = 'Try Again';
  retryButton.onclick = function() {
    errorContainer.remove();
    document.getElementById('message-input').focus();
  };
  errorContainer.appendChild(retryButton);
  
  // Add technical details in debug mode
  if (details && localStorage.getItem('chatbot_debug_mode') === 'true') {
    const detailsElement = document.createElement('div');
    detailsElement.className = 'debug-info show-debug';
    detailsElement.textContent = `Error details: ${details}`;
    errorContainer.appendChild(detailsElement);
  }
  
  messagesContainer.appendChild(errorContainer);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export async function sendMessage(chatId) {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  const isProcessingFlag = document.querySelector('.chat-container').dataset.isProcessing;
  if (isProcessingFlag === 'true') return;
  
  const messageText = messageInput.value.trim();
  if (!messageText) return;
  
  document.querySelector('.chat-container').dataset.isProcessing = 'true';
  sendButton.disabled = true;
  messageInput.value = '';
  addMessage(messageText, true);
  const loadingIndicator = addLoadingIndicator();
  
  logToDebugPanel('Sending message', 'info', { text: messageText, agentId: chatId });
  
  try {
    const requestData = {
      message: messageText,
      agentId: chatId,
      conversationId: localStorage.getItem(`conversation_${chatId}`) || null
    };
    
    logToDebugPanel('Request payload', 'info', requestData);
    
    const response = await fetch('/functions/chat-with-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    logToDebugPanel('Response status', 'info', { 
      status: response.status, 
      ok: response.ok,
      statusText: response.statusText
    });
    
    const data = await response.json();
    logToDebugPanel('Response data', 'info', data);
    
    removeLoadingIndicator();
    
    if (!response.ok || data.error) {
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      let detailedError = data.error || `${response.status} ${response.statusText}`;
      
      // More user-friendly error messages
      if (detailedError.includes("No agent found") || 
          detailedError.includes("Multiple agents found")) {
        errorMessage = "This chatbot doesn't appear to be configured correctly.";
      } else if (detailedError.includes("does not have an OpenAI assistant configured")) {
        errorMessage = "This chatbot hasn't been fully set up yet.";
      } else if (detailedError.includes("OpenAI API key")) {
        errorMessage = "The AI service is currently unavailable.";
      }
      
      showError(errorMessage, detailedError);
      throw new Error(detailedError);
    }
    
    // Save conversation ID if returned
    if (data.threadId) {
      localStorage.setItem(`conversation_${chatId}`, data.threadId);
      logToDebugPanel('Thread ID saved', 'info', data.threadId);
    }
    
    addMessage(data.response || "I couldn't process your message properly.", false);
    
  } catch (error) {
    console.error('Error:', error);
    logToDebugPanel('Error in fetch', 'error', { message: error.message, stack: error.stack });
    
    // Only show error if not already shown
    if (document.querySelector('.error-container') === null) {
      showError(null, error.message);
    }
  } finally {
    document.querySelector('.chat-container').dataset.isProcessing = 'false';
    sendButton.disabled = false;
    messageInput.focus();
  }
}

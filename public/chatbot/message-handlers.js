
import { logToDebugPanel, logDebug } from './debug-utils.js';
import { createConversation, saveMessage, updateConversationTitle } from './db-handlers.js';

export async function sendMessage(chatId) {
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatContainer = document.querySelector('.chat-container');
  
  const messageText = messageInput.value.trim();
  if (!messageText || chatContainer.dataset.isProcessing === 'true') {
    return;
  }
  
  try {
    // Set processing state
    chatContainer.dataset.isProcessing = 'true';
    sendButton.disabled = true;
    
    // Add user message to the UI
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'message user-message';
    userMessageElement.textContent = messageText;
    messagesContainer.appendChild(userMessageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Clear input
    messageInput.value = '';
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <span>AI is thinking</span>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesContainer.appendChild(loadingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Get saved thread and conversation IDs if any
    const savedThreadId = localStorage.getItem(`thread_${chatId}`);
    let conversationId = localStorage.getItem(`conversation_${chatId}`);
    
    // If no conversation exists yet, create one
    if (!conversationId) {
      try {
        conversationId = await createConversation(chatId);
        if (conversationId) {
          localStorage.setItem(`conversation_${chatId}`, conversationId);
          logDebug('Conversation ID saved', conversationId);
        }
      } catch (dbError) {
        // Log the error but continue - chat can still work without DB
        logToDebugPanel('Failed to create conversation in database', 'warning', dbError);
        // Continue with chat functionality even if DB operations fail
      }
    }
    
    // Save user message to database
    if (conversationId) {
      try {
        await saveMessage(conversationId, messageText, false);
      } catch (dbError) {
        // Log the error but continue with chat
        logToDebugPanel('Failed to save user message to database', 'warning', dbError);
      }
    }
    
    // Prepare request payload
    const payload = {
      message: messageText,
      agentId: chatId,
      conversationId: savedThreadId
    };
    
    logToDebugPanel('Sending message', 'info', { text: messageText, agentId: chatId });
    logToDebugPanel('Request payload', 'info', payload);
    
    // Send request to backend
    const response = await fetch('/functions/chat-with-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    logToDebugPanel('Response status', 'info', { 
      status: response.status, 
      ok: response.ok, 
      statusText: response.statusText 
    });
    
    const data = await response.json();
    logToDebugPanel('Response data', 'info', data);
    
    // Remove loading indicator
    messagesContainer.removeChild(loadingIndicator);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Save thread ID for future conversations
    if (data.threadId) {
      localStorage.setItem(`thread_${chatId}`, data.threadId);
      logDebug('Thread ID saved', data.threadId);
    }
    
    // Save bot response to database
    if (conversationId) {
      try {
        await saveMessage(conversationId, data.response, true, data.confidence);
        
        // Update conversation title with first few words of first message (if this is the first message)
        const botMessageCount = document.querySelectorAll('.bot-message').length;
        if (botMessageCount === 1) {
          const titleText = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
          await updateConversationTitle(conversationId, titleText);
        }
      } catch (dbError) {
        // Log the error but continue
        logToDebugPanel('Failed to save bot message to database', 'warning', dbError);
      }
    }
    
    // Add bot response
    const botMessageElement = document.createElement('div');
    botMessageElement.className = 'message bot-message';
    botMessageElement.textContent = data.response || "I'm sorry, I couldn't process your request.";
    messagesContainer.appendChild(botMessageElement);
    
    // Add confidence score if available
    if (data.confidence) {
      const debugEl = document.createElement('div');
      debugEl.className = 'debug-info';
      if (localStorage.getItem('chatbot_debug_mode') === 'true') {
        debugEl.classList.add('show-debug');
      }
      debugEl.textContent = `Confidence: ${(data.confidence * 100).toFixed(1)}%`;
      botMessageElement.appendChild(debugEl);
    }
    
  } catch (error) {
    // Log the error
    logToDebugPanel('Error in fetch', 'error', { 
      message: error.message, 
      stack: error.stack 
    });
    
    // Remove loading indicator if it exists
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
      messagesContainer.removeChild(loadingIndicator);
    }
    
    // Show error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
      <div>Error: ${error.message}</div>
      <button class="retry-button">Try Again</button>
    `;
    messagesContainer.appendChild(errorContainer);
    
    // Add retry functionality
    const retryButton = errorContainer.querySelector('.retry-button');
    retryButton.addEventListener('click', () => {
      messagesContainer.removeChild(errorContainer);
      messageInput.value = messageText;
      sendMessage(chatId);
    });
  } finally {
    // Reset processing state
    chatContainer.dataset.isProcessing = 'false';
    sendButton.disabled = false;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Focus input field
    messageInput.focus();
  }
}

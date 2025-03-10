
// Import utility functions from other modules
import { setupDebugPanel, runInitialDiagnostics } from './debug-utils.js';
import { sendMessage } from './message-handlers.js';

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get chat ID from URL
  const chatId = window.location.pathname.split('/').pop() || 'default';
  
  // Initialize debug panel
  const { debugMode } = setupDebugPanel();
  
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  // Data attribute to track processing state
  document.querySelector('.chat-container').dataset.isProcessing = 'false';
  
  // Send on button click
  sendButton.addEventListener('click', function() {
    sendMessage(chatId);
  });
  
  // Send on Enter key
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.querySelector('.chat-container').dataset.isProcessing !== 'true') {
      sendMessage(chatId);
    }
  });

  // Run diagnostics on load
  runInitialDiagnostics(chatId);
  
  // Focus input field on load
  messageInput.focus();
});

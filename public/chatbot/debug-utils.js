
// Debug utilities for chatbot
export function setupDebugPanel() {
  const debugMode = localStorage.getItem('chatbot_debug_mode') === 'true';
  const debugPanel = document.getElementById('debug-panel');
  
  if (debugMode) {
    debugPanel.classList.add('show');
    document.querySelectorAll('.debug-info').forEach(el => {
      el.classList.add('show-debug');
    });
  }
  
  // Debug toggle
  const debugToggle = document.getElementById('debug-toggle');
  debugToggle.addEventListener('click', function() {
    const currentState = localStorage.getItem('chatbot_debug_mode') === 'true';
    const newState = !currentState;
    localStorage.setItem('chatbot_debug_mode', newState);
    
    debugPanel.classList.toggle('show');
    document.querySelectorAll('.debug-info').forEach(el => {
      el.classList.toggle('show-debug');
    });
    
    logToDebugPanel('Debug mode ' + (newState ? 'enabled' : 'disabled'), 'info');
  });

  return { debugMode };
}

export function logToDebugPanel(message, level = 'info', data = null) {
  const debugPanel = document.getElementById('debug-panel');
  if (!debugPanel) return;
  
  const timestamp = new Date().toISOString();
  const entry = document.createElement('div');
  entry.className = `debug-entry debug-entry-${level}`;
  
  const timestampSpan = document.createElement('span');
  timestampSpan.className = 'debug-entry-timestamp';
  timestampSpan.textContent = timestamp;
  
  entry.appendChild(timestampSpan);
  
  const messageText = typeof data === 'object' ? 
    `${message}: ${JSON.stringify(data, null, 2)}` : 
    data ? `${message}: ${data}` : message;
  
  entry.appendChild(document.createTextNode(messageText));
  debugPanel.appendChild(entry);
  debugPanel.scrollTop = debugPanel.scrollHeight;
  
  // Also log to console for developers
  const consoleMethod = level === 'error' ? console.error : 
                       level === 'warning' ? console.warn : console.log;
  consoleMethod(`[Chatbot ${level}] ${message}`, data || '');
}

export function logDebug(message, data) {
  const messagesContainer = document.getElementById('messages');
  // Add debug info to the last message
  const lastMessage = messagesContainer.lastChild;
  if (lastMessage) {
    let debugEl = lastMessage.querySelector('.debug-info');
    if (!debugEl) {
      debugEl = document.createElement('div');
      debugEl.className = 'debug-info';
      if (localStorage.getItem('chatbot_debug_mode') === 'true') {
        debugEl.classList.add('show-debug');
      }
      lastMessage.appendChild(debugEl);
    }
    
    const timestamp = new Date().toISOString();
    const debugText = typeof data === 'object' ? JSON.stringify(data) : data;
    debugEl.innerHTML += `<div>${timestamp}: ${message} ${debugText || ''}</div>`;
  }
  
  // Also log to debug panel
  logToDebugPanel(message, 'info', data);
}

export function runInitialDiagnostics(chatId) {
  logSystemInfo(chatId);
  checkNetworkConnectivity();
  checkCorsConfiguration();
  
  // Add test message with error details if in debug mode
  if (localStorage.getItem('chatbot_debug_mode') === 'true') {
    logToDebugPanel('Debug mode active - running in diagnostic mode', 'info');
    const messagesContainer = document.getElementById('messages');
    const testMessage = document.createElement('div');
    testMessage.className = 'message bot-message';
    testMessage.innerHTML = '<strong>Debug Mode Active</strong><br>Use the debug panel to see detailed information about requests and responses.';
    messagesContainer.appendChild(testMessage);
  }
}

export function logSystemInfo(chatId) {
  const systemInfo = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    origin: window.location.origin,
    chatId: chatId,
    savedThreadId: localStorage.getItem(`conversation_${chatId}`),
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    timestamp: new Date().toISOString()
  };
  
  logToDebugPanel('System info', 'info', systemInfo);
}

export function checkNetworkConnectivity() {
  const online = navigator.onLine;
  logToDebugPanel('Network connectivity', 'info', { online });
  return online;
}

export async function checkCorsConfiguration() {
  try {
    const response = await fetch('/functions/chat-with-assistant', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    logToDebugPanel('CORS headers', 'info', corsHeaders);
    return response.ok;
  } catch (error) {
    logToDebugPanel('CORS check failed', 'error', { message: error.message });
    return false;
  }
}

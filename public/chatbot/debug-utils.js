
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

  // Initialize the enhanced debug panel
  initializeEnhancedDebugPanel();

  return { debugMode };
}

// Initialize the enhanced debug panel with filters and collapsible sections
function initializeEnhancedDebugPanel() {
  const debugPanel = document.getElementById('debug-panel');
  if (!debugPanel) return;

  // Create toolbar for the debug panel
  const toolbar = document.createElement('div');
  toolbar.className = 'debug-toolbar';
  
  // Create search input
  const searchContainer = document.createElement('div');
  searchContainer.style.display = 'flex';
  searchContainer.style.alignItems = 'center';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'debug-search';
  searchInput.placeholder = 'Search logs...';
  searchInput.addEventListener('input', function() {
    filterDebugEntries();
  });
  
  searchContainer.appendChild(searchInput);
  
  // Create filter buttons
  const filters = document.createElement('div');
  filters.className = 'debug-filters';
  
  const allFilterBtn = createFilterButton('all', 'All', true);
  const infoFilterBtn = createFilterButton('info', 'Info');
  const warningFilterBtn = createFilterButton('warning', 'Warning');
  const errorFilterBtn = createFilterButton('error', 'Error');
  
  filters.appendChild(allFilterBtn);
  filters.appendChild(infoFilterBtn);
  filters.appendChild(warningFilterBtn);
  filters.appendChild(errorFilterBtn);
  
  // Create action buttons
  const actions = document.createElement('div');
  actions.className = 'debug-actions';
  
  const clearBtn = document.createElement('button');
  clearBtn.className = 'debug-action-button debug-clear-all';
  clearBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Clear';
  clearBtn.addEventListener('click', function() {
    clearDebugLogs();
  });
  
  const collapseAllBtn = document.createElement('button');
  collapseAllBtn.className = 'debug-action-button';
  collapseAllBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="19 15 12 8 5 15"></polyline></svg> Collapse All';
  collapseAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.debug-group-content').forEach(el => {
      el.classList.remove('expanded');
    });
  });
  
  const expandAllBtn = document.createElement('button');
  expandAllBtn.className = 'debug-action-button';
  expandAllBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="19 9 12 16 5 9"></polyline></svg> Expand All';
  expandAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.debug-group-content').forEach(el => {
      el.classList.add('expanded');
    });
  });
  
  actions.appendChild(clearBtn);
  actions.appendChild(collapseAllBtn);
  actions.appendChild(expandAllBtn);
  
  toolbar.appendChild(searchContainer);
  toolbar.appendChild(filters);
  toolbar.appendChild(actions);
  
  // Create log container
  const logContainer = document.createElement('div');
  logContainer.id = 'debug-log-container';
  
  // Add toolbar and log container to debug panel
  debugPanel.innerHTML = '';
  debugPanel.appendChild(toolbar);
  debugPanel.appendChild(logContainer);
  
  // Create initial log groups
  createLogGroup('System Info', 'system-info');
  createLogGroup('Network Events', 'network');
  createLogGroup('User Interactions', 'user');
  createLogGroup('API Responses', 'api');
  createLogGroup('Errors', 'error');
}

function createFilterButton(type, label, isActive = false) {
  const button = document.createElement('button');
  button.className = `debug-filter-button ${type}${isActive ? ' active' : ''}`;
  button.textContent = label;
  button.dataset.filter = type;
  button.addEventListener('click', function() {
    document.querySelectorAll('.debug-filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
    filterDebugEntries();
  });
  return button;
}

function createLogGroup(title, id) {
  const logContainer = document.getElementById('debug-log-container');
  if (!logContainer) return;
  
  const group = document.createElement('div');
  group.className = 'debug-group';
  group.id = `debug-group-${id}`;
  
  const header = document.createElement('div');
  header.className = 'debug-group-header';
  
  const titleEl = document.createElement('div');
  titleEl.className = 'debug-group-title';
  titleEl.textContent = title;
  
  const toggleIcon = document.createElement('span');
  toggleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="19 9 12 16 5 9"></polyline></svg>';
  
  header.appendChild(titleEl);
  header.appendChild(toggleIcon);
  
  const content = document.createElement('div');
  content.className = 'debug-group-content';
  content.id = `debug-content-${id}`;
  
  header.addEventListener('click', function() {
    content.classList.toggle('expanded');
    toggleIcon.innerHTML = content.classList.contains('expanded') ? 
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="19 15 12 8 5 15"></polyline></svg>' : 
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="19 9 12 16 5 9"></polyline></svg>';
  });
  
  group.appendChild(header);
  group.appendChild(content);
  logContainer.appendChild(group);
}

function determineLogGroup(message, level) {
  if (level === 'error') return 'error';
  
  const messageLower = message.toLowerCase();
  if (messageLower.includes('system info') || messageLower.includes('navigator')) return 'system-info';
  if (messageLower.includes('network') || messageLower.includes('cors') || messageLower.includes('connectivity')) return 'network';
  if (messageLower.includes('sending message') || messageLower.includes('user message')) return 'user';
  if (messageLower.includes('response') || messageLower.includes('data')) return 'api';
  
  return 'system-info'; // Default group
}

function filterDebugEntries() {
  const searchText = document.querySelector('.debug-search').value.toLowerCase();
  const activeFilter = document.querySelector('.debug-filter-button.active').dataset.filter;
  
  document.querySelectorAll('.debug-entry').forEach(entry => {
    const entryText = entry.textContent.toLowerCase();
    const entryLevel = entry.className.includes('error') ? 'error' : 
                      entry.className.includes('warning') ? 'warning' : 'info';
    
    const matchesSearch = searchText === '' || entryText.includes(searchText);
    const matchesFilter = activeFilter === 'all' || entryLevel === activeFilter;
    
    entry.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
  });
}

function clearDebugLogs() {
  document.querySelectorAll('.debug-group-content').forEach(content => {
    content.innerHTML = '';
  });
  logToDebugPanel('Debug logs cleared', 'info');
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
  
  // Add to the appropriate group
  const groupId = determineLogGroup(message, level);
  const groupContent = document.getElementById(`debug-content-${groupId}`);
  
  if (groupContent) {
    groupContent.appendChild(entry);
    // Auto-expand the group if it's an error
    if (level === 'error') {
      groupContent.classList.add('expanded');
    }
  } else {
    // Fallback to adding directly to the debug panel if group not found
    const logContainer = document.getElementById('debug-log-container');
    if (logContainer) {
      logContainer.appendChild(entry);
    } else {
      debugPanel.appendChild(entry);
    }
  }
  
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

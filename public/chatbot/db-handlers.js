import { logToDebugPanel, logDebug } from './debug-utils.js';

// Initialize Supabase client - using dynamic import for browser compatibility
let supabaseClient = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    const supabaseUrl = window.chatbaseConfig?.supabaseUrl || 'https://qaopcduyhmweewrcwkoy.supabase.co';
    const supabaseKey = window.chatbaseConfig?.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhb3BjZHV5aG13ZWV3cmN3a295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzM3MjQsImV4cCI6MjA1NjQwOTcyNH0.-IBnucBUA_FMYpx7xKebNhYIXqaems-du5KUvG5T04A';
    
    logDebug('Initializing Supabase client', { url: supabaseUrl });
    
    // Najprostsze podejście - ładowanie bezpośrednio z UMD
    try {
      // Próbujemy załadować Supabase UMD
      const scriptUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.7.1/dist/umd/supabase.min.js';
      
      // Najpierw sprawdzamy, czy skrypt już jest załadowany
      if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
        logToDebugPanel('Loading Supabase from CDN', 'info');
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = scriptUrl;
          script.async = true;
          script.onload = resolve;
          script.onerror = (e) => reject(new Error('Failed to load Supabase script'));
          document.head.appendChild(script);
        });
      }
      
      // Czekamy trochę, żeby skrypt się załadował
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sprawdzamy czy mamy dostęp do globalnego obiektu
      if (typeof window.supabase === 'undefined') {
        window.supabase = { createClient: (url, key) => {
          // Jeśli nie możemy załadować Supabase, zwracamy "mockowany" klient
          // który pozwoli na działanie czatu bez zapisywania do bazy
          logToDebugPanel('Using mock Supabase client', 'warning');
          return {
            from: () => ({
              insert: () => ({ select: () => ({ single: () => ({ data: { id: crypto.randomUUID() }, error: null }) }) }),
              select: () => ({ data: [], error: null }),
              update: () => ({ error: null }),
              eq: () => ({ data: null, error: null })
            })
          };
        }};
      }
      
      // Tworzymy klienta
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      
      // Testujemy połączenie
      const testQuery = await supabaseClient.from('messages').select('id').limit(1);
      if (testQuery.error) {
        throw new Error(`Supabase connection test failed: ${testQuery.error.message}`);
      }
      
      logToDebugPanel('Supabase client initialized successfully', 'info');
      return supabaseClient;
    } catch (e) {
      // Jeśli nie możemy załadować Supabase, logujemy i zwracamy mockowany klient
      logToDebugPanel(`Supabase initialization error: ${e.message}`, 'error');
      
      // Mockujemy klienta, żeby czat dalej działał
      return {
        from: () => ({
          insert: () => ({ select: () => ({ single: () => ({ data: { id: crypto.randomUUID() }, error: null }) }) }),
          select: () => ({ data: [], error: null }),
          update: () => ({ error: null }),
          eq: () => ({ data: null, error: null })
        })
      };
    }
  } catch (error) {
    logToDebugPanel('Failed to initialize Supabase client', 'error', error);
    return null;
  }
}

/**
 * Session duration in milliseconds (30 minutes)
 */
const SESSION_DURATION = 30 * 60 * 1000;

/**
 * Get active conversation ID for an agent, or null if no active conversation
 * @param {string} agentId - The ID of the agent
 * @returns {string|null} - The conversation ID or null if no active conversation
 */
export function getActiveConversation(agentId) {
  const conversationId = localStorage.getItem(`conversation_id_${agentId}`);
  const expiryTime = localStorage.getItem(`conversation_expiry_${agentId}`);
  
  // Check if there's an active conversation that hasn't expired
  if (conversationId && expiryTime && Date.now() < parseInt(expiryTime, 10)) {
    // Refresh expiry time since the conversation is being used
    const newExpiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem(`conversation_expiry_${agentId}`, newExpiryTime);
    
    logDebug('Using existing conversation', { conversationId, expiresIn: 'refreshed to 30 minutes' });
    return conversationId;
  }
  
  // Clear expired data if it exists
  if (conversationId || expiryTime) {
    logDebug('Conversation expired', { conversationId });
    localStorage.removeItem(`conversation_id_${agentId}`);
    localStorage.removeItem(`conversation_expiry_${agentId}`);
  }
  
  return null;
}

/**
 * Create a new conversation in the database
 * @param {string} agentId - The ID of the agent
 * @returns {Promise<string|null>} - The conversation ID or null if creation failed
 */
export async function createConversation(agentId) {
  try {
    // Check if we have an active conversation
    const existingConversation = getActiveConversation(agentId);
    if (existingConversation) {
      return existingConversation;
    }
    
    // Generate a proper UUID for the conversation
    const conversationId = crypto.randomUUID();
    
    // Initialize Supabase
    const supabase = await initSupabase();
    
    // Get or create anonymous user ID (ensure it's a valid UUID)
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId || userId.length !== 36) {
      userId = crypto.randomUUID();
      localStorage.setItem('anonymous_user_id', userId);
    }
    
    // Get origin for metadata
    const origin = window.location.origin || 'unknown';
    
    // Generate a title for embedded chat
    const title = `Chat from ${origin}`.substring(0, 50);
    
    logToDebugPanel('Creating conversation', 'info', { userId, agentId, conversationId });
    
    // Create conversation in database with explicit ID and agent_id
    const { error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,        // Explicitly provide UUID
        user_id: null,             // Use NULL for user_id in embedded chats
        title: title,              // Use better title with origin
        source: 'embedded',        // Use correct source for proper filtering
        agent_id: agentId,         // Store the agent ID to relate conversation to specific agent
        metadata: {
          origin: origin,
          embedded: true,          // Mark as embedded in metadata
          timestamp: new Date().toISOString()
        }
      });
    
    if (error) {
      logToDebugPanel('Database error when creating conversation', 'error', error);
    }
    
    // Store conversation ID and set expiry time (30 minutes from now)
    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem(`conversation_id_${agentId}`, conversationId);
    localStorage.setItem(`conversation_expiry_${agentId}`, expiryTime.toString());
    
    logToDebugPanel('Conversation created with 30-minute session', 'info', { 
      conversationId, 
      expiresAt: new Date(expiryTime).toLocaleTimeString() 
    });
    
    return conversationId;
  } catch (error) {
    logToDebugPanel('Error creating conversation', 'error', error);
    return null;
  }
}

/**
 * Save a message to the database
 * @param {string} agentId - The agent ID (used to retrieve the conversation ID)
 * @param {string} content - The message content
 * @param {boolean} isBot - Whether the message is from a bot
 * @param {number|null} confidence - The confidence score (for bot messages)
 * @returns {Promise<boolean>} - Whether the message was saved successfully
 */
export async function saveMessage(agentId, content, isBot, confidence = null) {
  try {
    // Get the proper conversation ID (not thread ID) and refresh its expiry
    const conversationId = getActiveConversation(agentId);
    
    if (!conversationId) {
      logToDebugPanel('Cannot save message: No conversation ID for this agent', 'error');
      return false;
    }
    
    // Initialize Supabase
    const supabase = await initSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    
    logToDebugPanel('Saving message', 'info', { 
      conversationId, 
      agentId,
      isBot, 
      contentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });
    
    // Insert message with the proper conversation ID
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: content,
        is_bot: isBot,
        confidence: isBot ? confidence : null
      });
    
    if (error) throw error;
    
    logToDebugPanel('Message saved successfully', 'info');
    return true;
  } catch (error) {
    logToDebugPanel('Error saving message', 'error', error);
    return false;
  }
}

/**
 * Update the title of a conversation
 * @param {string} agentId - The agent ID (used to retrieve the conversation ID)
 * @param {string} title - The new title
 * @returns {Promise<boolean>} - Whether the title was updated successfully
 */
export async function updateConversationTitle(agentId, title) {
  // Get the proper conversation ID (and refresh its expiry)
  const conversationId = getActiveConversation(agentId);
  try {
    // Initialize Supabase
    const supabase = await initSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    
    if (!conversationId) {
      logToDebugPanel('Cannot update title: No conversation ID', 'error');
      return false;
    }
    
    // Update title
    const { error } = await supabase
      .from('conversations')
      .update({ title: title })
      .eq('id', conversationId);
    
    if (error) throw error;
    
    logToDebugPanel('Conversation title updated', 'info', { conversationId, title });
    return true;
  } catch (error) {
    logToDebugPanel('Error updating conversation title', 'error', error);
    return false;
  }
}

/**
 * Get user ID from localStorage or create a new one
 * @returns {string} - The user ID
 */
export function getUserId() {
  let userId = localStorage.getItem('anonymous_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('anonymous_user_id', userId);
  }
  return userId;
}

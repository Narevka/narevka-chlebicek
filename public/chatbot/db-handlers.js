import { logToDebugPanel, logDebug } from './debug-utils.js';

// Initialize Supabase client - using dynamic import for browser compatibility
let supabaseClient = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    const supabaseUrl = window.chatbaseConfig?.supabaseUrl || 'https://qaopcduyhmweewrcwkoy.supabase.co';
    const supabaseKey = window.chatbaseConfig?.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhb3BjZHV5aG13ZWV3cmN3a295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzM3MjQsImV4cCI6MjA1NjQwOTcyNH0.-IBnucBUA_FMYpx7xKebNhYIXqaems-du5KUvG5T04A';
    
    logDebug('Initializing Supabase client', { url: supabaseUrl });
    
    // Multiple ways to access the Supabase client
    if (typeof window.supabase === 'function') {
      // For newer versions where supabase is a function
      supabaseClient = window.supabase(supabaseUrl, supabaseKey);
      return supabaseClient;
    } else if (window.supabase && typeof window.supabase.createClient === 'function') {
      // For versions where createClient is a method
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      return supabaseClient;
    } else if (window.createClient) {
      // Direct global createClient
      supabaseClient = window.createClient(supabaseUrl, supabaseKey);
      return supabaseClient;
    } else {
      // Try dynamic import as a fallback
      try {
        const { createClient } = await import('https://unpkg.com/@supabase/supabase-js@2/dist/module/index.js');
        supabaseClient = createClient(supabaseUrl, supabaseKey);
        return supabaseClient;
      } catch (importError) {
        throw new Error(`Could not import Supabase client: ${importError.message}`);
      }
    }
  } catch (error) {
    logToDebugPanel('Failed to initialize Supabase client', 'error', error);
    return null;
  }
}

/**
 * Create a new conversation in the database
 * @param {string} agentId - The ID of the agent
 * @returns {Promise<string|null>} - The conversation ID or null if creation failed
 */
export async function createConversation(agentId) {
  try {
    // Initialize Supabase
    const supabase = await initSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Get or create anonymous user ID
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('anonymous_user_id', userId);
    }
    
    logToDebugPanel('Creating conversation', 'info', { userId, agentId });
    
    // Create conversation in database
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: 'Embedded Chat',
        source: 'embedded',
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    logToDebugPanel('Conversation created', 'info', { conversationId: data.id });
    return data.id;
  } catch (error) {
    logToDebugPanel('Error creating conversation', 'error', error);
    return null;
  }
}

/**
 * Save a message to the database
 * @param {string} conversationId - The conversation ID
 * @param {string} content - The message content
 * @param {boolean} isBot - Whether the message is from a bot
 * @param {number|null} confidence - The confidence score (for bot messages)
 * @returns {Promise<boolean>} - Whether the message was saved successfully
 */
export async function saveMessage(conversationId, content, isBot, confidence = null) {
  try {
    // Initialize Supabase
    const supabase = await initSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    
    if (!conversationId) {
      logToDebugPanel('Cannot save message: No conversation ID', 'error');
      return false;
    }
    
    logToDebugPanel('Saving message', 'info', { 
      conversationId, 
      isBot, 
      contentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });
    
    // Insert message
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
 * @param {string} conversationId - The conversation ID
 * @param {string} title - The new title
 * @returns {Promise<boolean>} - Whether the title was updated successfully
 */
export async function updateConversationTitle(conversationId, title) {
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


import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Functions for managing conversations
 */

// Create a new conversation in the database
export async function createDatabaseConversation(
  supabaseClient: any,
  userIdentifier: string,
  conversationSource: string,
  origin: string,
  referer: string,
  userLanguage: string
): Promise<string | null> {
  try {
    // Generate a conversation ID
    const generatedConversationId = crypto.randomUUID();
    
    // Use NULL for user_id in embedded chats
    const userIdForEmbeddedChat = null;
    
    console.log(`Creating conversation with source: ${conversationSource}, language: ${userLanguage}`);
    
    // Insert the conversation
    const { data, error } = await supabaseClient
      .from('conversations')
      .insert({
        id: generatedConversationId,
        user_id: userIdForEmbeddedChat,
        title: 'Embedded Chat',
        source: conversationSource,
        metadata: { 
          anonymous_id: userIdentifier,
          timestamp: new Date().toISOString(),
          origin: origin || 'unknown',
          referrer: referer || 'unknown',
          language: userLanguage
        }
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    console.log(`Created new conversation in database with ID: ${data.id}, language: ${userLanguage}`);
    return data.id;
  } catch (error) {
    console.error('Error creating conversation in database:', error);
    return null;
  }
}

// Save a message to the database
export async function saveMessageToDatabase(
  supabaseClient: any,
  conversationId: string,
  content: string,
  isBot: boolean,
  confidence?: number,
  language?: string
): Promise<boolean> {
  try {
    if (!conversationId || !content) {
      console.error('Missing conversation_id or content when saving message');
      return false;
    }
    
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        is_bot: isBot,
        confidence,
        metadata: language ? { language } : undefined
      });
    
    console.log(`Saved ${isBot ? 'bot' : 'user'} message to database`);
    return true;
  } catch (error) {
    console.error('Error saving message to database:', error);
    return false;
  }
}

// Extract source from referer URL
export function extractSourceFromReferer(referer: string): string {
  try {
    const sourceUrl = referer ? new URL(referer) : null;
    if (sourceUrl && sourceUrl.searchParams.has('source')) {
      return sourceUrl.searchParams.get('source') || 'embedded';
    }
  } catch (e) {
    console.warn('Could not parse referer URL');
  }
  return 'embedded';
}

// Verify request origin for security
export function verifyRequestOrigin(origin: string, refererDomain: string): boolean {
  const allowedOrigins = [
    'https://www.narevka.com', 
    'https://narevka.com',
    'http://localhost:3000',
    'http://localhost:4000'
  ];
  
  return allowedOrigins.some(allowed => 
    origin.includes(allowed) || refererDomain.includes(allowed)
  );
}

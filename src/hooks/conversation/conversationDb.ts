
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interfejs dla parametrów wiadomości
interface MessageParams {
  conversation_id: string;
  content: string;
  is_bot: boolean;
  confidence?: number;
  metadata?: Record<string, any>;
}

// Interfejs dla metadanych konwersacji
interface ConversationMetadata {
  language?: string;
  [key: string]: any;
}

// Funkcja do zapisywania wiadomości w bazie danych
export const saveMessageToDb = async (params: MessageParams) => {
  try {
    const { conversation_id, content, is_bot, confidence, metadata } = params;
    
    if (!conversation_id || !content) {
      console.error("Missing conversation_id or content in saveMessageToDb");
      return null;
    }
    
    // Zapisz wiadomość w bazie danych
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        content,
        is_bot,
        confidence,
        metadata
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.id;
  } catch (error: any) {
    console.error("Error saving message to database:", error);
    return null;
  }
};

// Funkcja do tworzenia nowej konwersacji
export const createConversation = async (
  userId: string, 
  source: string = 'Playground',
  metadata: ConversationMetadata = {},
  agentId?: string
) => {
  try {
    const title = 'New Conversation';
    
    // Utwórz konwersację w bazie danych
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        source,
        agent_id: agentId, // Add agent_id to conversation
        metadata // Przekaż metadane zawierające język
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Created new conversation with ID: ${data.id}, source: ${source}, agent_id: ${agentId}, metadata:`, metadata);
    return data.id;
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    const errorMessage = error.message || "Failed to create conversation";
    
    // Sprawdź język z metadanych, aby wyświetlić odpowiedni komunikat
    if (metadata.language === 'pl') {
      toast.error("Nie udało się utworzyć nowej rozmowy");
    } else {
      toast.error("Failed to create new conversation");
    }
    
    return null;
  }
};

// Funkcja do aktualizacji tytułu konwersacji
export const updateConversationTitle = async (
  conversationId: string, 
  userId: string, 
  firstMessage: string
) => {
  try {
    // Generate a title by truncating the first message
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 47) + '...'
      : firstMessage;
    
    // Update the conversation title
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error updating conversation title:", error);
    return false;
  }
};

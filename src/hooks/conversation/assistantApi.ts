
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message } from "./types";

// Funkcja wykrywająca język przeglądarki
const detectBrowserLanguage = (): string => {
  const userLanguage = navigator.language || navigator.languages?.[0] || 'en';
  // Pobierz główny kod języka (pl-PL -> pl)
  const primaryLanguage = userLanguage.split('-')[0];
  
  // Obsługujemy obecnie tylko polski i angielski
  return ['pl', 'en'].includes(primaryLanguage) ? primaryLanguage : 'en';
};

export const getAssistantResponse = async (
  message: string,
  agentId: string,
  threadId: string | null,
  dbConversationId: string | null = null,
  language?: string // Dodajemy opcjonalny parametr języka
) => {
  try {
    // Wykrywamy język przeglądarki, jeśli nie został jawnie określony
    const detectedLanguage = language || detectBrowserLanguage();
    
    console.log(`Sending message with language: ${detectedLanguage}`);
    
    // Call our edge function to get a response from the assistant
    const responseData = await supabase.functions.invoke('chat-with-assistant', {
      body: { 
        message: message,
        agentId: agentId,
        conversationId: threadId,
        dbConversationId: dbConversationId, // Pass the database conversation ID
        language: detectedLanguage // Przekazujemy wykryty język
      }
    });
    
    if (responseData.error) {
      throw new Error(responseData.error.message || "Failed to get assistant response");
    }
    
    const newThreadId = responseData.data.threadId || null;
    
    const botResponse: Message = { 
      id: uuidv4(),
      content: responseData.data.response || "I'm sorry, I couldn't generate a response.", 
      isUser: false,
      confidence: responseData.data.confidence || 0.75,
      language: responseData.data.language || detectedLanguage // Zapisujemy język odpowiedzi
    };
    
    return {
      botResponse,
      threadId: newThreadId,
      language: responseData.data.language || detectedLanguage // Zwracamy informację o języku
    };
  } catch (error: any) {
    console.error("Error getting assistant response:", error);
    
    // Dostosuj komunikaty błędów do wykrytego języka
    const language = detectBrowserLanguage();
    let errorMessage = "Failed to get assistant response";
    
    if (language === 'pl') {
      errorMessage = "Nie udało się uzyskać odpowiedzi asystenta";
      toast.error(error.message || errorMessage);
      
      return {
        botResponse: { 
          id: uuidv4(),
          content: "Przepraszam, wystąpił błąd podczas przetwarzania Twojego zapytania. Proszę spróbować ponownie.", 
          isUser: false,
          language: 'pl'
        },
        threadId: null,
        language: 'pl'
      };
    } else {
      toast.error(error.message || errorMessage);
      
      // Return error message in English (default)
      return {
        botResponse: { 
          id: uuidv4(),
          content: "Sorry, I encountered an error processing your request. Please try again.", 
          isUser: false,
          language: 'en'
        },
        threadId: null,
        language: 'en'
      };
    }
  }
};

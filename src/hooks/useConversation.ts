
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Message, ConversationState } from "./conversation/types";
import { saveMessageToDb, createConversation, updateConversationTitle } from "./conversation/conversationDb";
import { getAssistantResponse } from "./conversation/assistantApi";

// Function to detect browser language
const detectBrowserLanguage = (): string => {
  // First check for stored preference
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && ['pl', 'en'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Fall back to browser language
  const userLanguage = navigator.language || navigator.languages?.[0] || 'en';
  const primaryLanguage = userLanguage.split('-')[0];
  return ['pl', 'en'].includes(primaryLanguage) ? primaryLanguage : 'en';
};

// Function to return initial greeting in the appropriate language
const getInitialGreeting = (language: string): string => {
  if (language === 'pl') {
    return "Cześć! W czym mogę pomóc?";
  }
  return "Hi! What can I help you with?";
};

// Export the Message type with the correct syntax for isolatedModules
export type { Message };

export const useConversation = (userId: string | undefined, agentId: string | undefined, source: string = "Playground") => {
  // Detect browser language at the beginning
  const detectedLanguage = detectBrowserLanguage();
  
  const [language, setLanguage] = useState<string>(detectedLanguage);
  const [messages, setMessages] = useState<Array<Message>>([
    { content: getInitialGreeting(detectedLanguage), isUser: false, language: detectedLanguage }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  // Add flag to prevent duplicate initialization
  const [initialized, setInitialized] = useState(false);

  // Listen for language changes from localStorage
  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && ['pl', 'en'].includes(savedLanguage) && savedLanguage !== language) {
        setLanguage(savedLanguage);
      }
    };

    // Set up event listener for storage changes
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, [language]);

  useEffect(() => {
    // Create a new conversation when component mounts
    const initConversation = async () => {
      if (!userId || initialized) return;

      // Use the source parameter passed to the hook
      console.log("Initializing conversation with source:", source, "language:", language);
      const newConversationId = await createConversation(userId, source, { language });
      
      if (newConversationId) {
        setConversationId(newConversationId);
        setInitialized(true);
        
        // Save initial bot message
        await saveMessageToDb({
          conversation_id: newConversationId,
          content: getInitialGreeting(language),
          is_bot: true,
          metadata: { language }
        });
      }
    };

    initConversation();
  }, [userId, source, initialized, language]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId || !agentId) return;
    
    const userMessage = {
      id: uuidv4(),
      content: message,
      isUser: true,
      language: language
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    
    // Save user message to database
    await saveMessageToDb({
      conversation_id: conversationId,
      content: message,
      is_bot: false,
      metadata: { language }
    });
    
    try {
      // Pass the database conversation ID and language to the edge function
      const { botResponse, threadId: newThreadId, language: detectedLanguage } = await getAssistantResponse(
        message, 
        agentId, 
        threadId,
        conversationId,
        language // Pass the current language
      );
      
      // Update language if it changed
      if (detectedLanguage && detectedLanguage !== language) {
        setLanguage(detectedLanguage);
      }
      
      // Update thread ID if it's a new conversation
      if (newThreadId && !threadId) {
        setThreadId(newThreadId);
      }
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to database
      await saveMessageToDb({
        conversation_id: conversationId,
        content: botResponse.content,
        is_bot: true,
        confidence: botResponse.confidence,
        metadata: { language: botResponse.language || language }
      });
      
      // Update conversation title with the first user message if it's the second message in the conversation
      if (messages.length === 1) {
        updateConversationTitle(conversationId, userId, message);
      }
    } finally {
      setSendingMessage(false);
    }
    
    setInputMessage("");
  }, [conversationId, threadId, agentId, userId, messages.length, language]);

  const resetConversation = useCallback(async () => {
    if (!userId) return;

    // Reset initialized state to allow creating a new conversation
    setInitialized(false);

    // Create a new conversation with the same source
    console.log("Resetting conversation with source:", source, "language:", language);
    const newConversationId = await createConversation(userId, source, { language });
    
    if (newConversationId) {
      setConversationId(newConversationId);
      setThreadId(null); // Reset OpenAI thread ID
      setMessages([{ content: getInitialGreeting(language), isUser: false, language }]);
      setInitialized(true); // Mark as initialized with the new conversation
      
      // Save initial bot message
      await saveMessageToDb({
        conversation_id: newConversationId,
        content: getInitialGreeting(language),
        is_bot: true,
        metadata: { language }
      });
      
      // Adjust message to language
      if (language === 'pl') {
        toast.success("Rozmowa zresetowana");
      } else {
        toast.success("Conversation reset");
      }
    } else {
      // Adjust error message to language
      if (language === 'pl') {
        toast.error("Nie udało się zresetować rozmowy");
      } else {
        toast.error("Failed to reset conversation");
      }
    }
  }, [userId, source, language]);

  // Add function to change language
  const changeLanguage = useCallback((newLanguage: 'pl' | 'en') => {
    if (newLanguage === language) return;
    
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    
    // Add message about language change
    if (newLanguage === 'pl') {
      setMessages(prev => [...prev, { 
        id: uuidv4(),
        content: "Zmieniono język na polski. W czym mogę pomóc?", 
        isUser: false,
        language: 'pl'
      }]);
      toast.success("Zmieniono język na polski");
    } else {
      setMessages(prev => [...prev, { 
        id: uuidv4(),
        content: "Language changed to English. How can I help you?", 
        isUser: false,
        language: 'en'
      }]);
      toast.success("Language changed to English");
    }
  }, [language]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation,
    language,
    changeLanguage
  };
};

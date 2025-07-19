import { useState, useEffect } from 'react';
import { useOpenRouter, OpenRouterMessage } from './useOpenRouter';
import { useToast } from './use-toast';

export interface ChatMessage {
  id: string;
  message: string;
  role: 'user' | 'ai';
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are a friendly, patient English teacher helping non-native speakers improve their English. Your responses should be:

1. Clear and simple - use everyday vocabulary
2. Encouraging - always praise effort and progress
3. Corrective but gentle - if you notice grammar mistakes, gently correct them by including the correct form in your response
4. Conversational - ask follow-up questions to keep the conversation going
5. Educational - provide brief explanations when helpful
6. Supportive - create a safe space for learning

Keep responses conversational and under 100 words. Always end with a question or encouragement to continue the conversation.`;

export const useChat = (apiKey: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage, isLoading, error, clearError } = useOpenRouter();
  const { toast } = useToast();

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: "Hello! I'm your AI English tutor. I'm here to help you practice and improve your English in a friendly, supportive way. You can speak to me using the microphone button, or type your questions. What would you like to work on today?",
        role: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const sendUserMessage = async (userMessage: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key to start chatting.",
        variant: "destructive"
      });
      return;
    }

    clearError();

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userChatMessage]);

    // Prepare messages for AI
    const conversationHistory: OpenRouterMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: msg.message
      })),
      { role: 'user', content: userMessage }
    ];

    // Get AI response
    const aiResponse = await sendMessage(conversationHistory, apiKey);

    if (aiResponse) {
      const aiChatMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        message: aiResponse,
        role: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiChatMessage]);

      // Auto-speak the AI response
      if ('speechSynthesis' in window) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(aiResponse);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        }, 500);
      }
    } else if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendUserMessage,
    isLoading,
    error,
    clearChat
  };
};
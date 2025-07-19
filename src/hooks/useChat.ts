
import { useState, useEffect } from 'react';
import { useOpenRouter, OpenRouterMessage } from './useOpenRouter';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ChatSession } from '@/types/database';

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
  const { user, profile } = useAuth();

  // Load chat history from Supabase
  useEffect(() => {
    if (user && profile) {
      loadChatHistory();
    } else {
      // Add welcome message for non-authenticated users
      addWelcomeMessage();
    }
  }, [user, profile]);

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      message: "Hello! I'm your AI English tutor. I'm here to help you practice and improve your English in a friendly, supportive way. You can speak to me using the microphone button, or type your questions. What would you like to work on today?",
      role: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(20); // Load last 20 messages

      if (error) throw error;

      if (data && data.length > 0) {
        const chatMessages: ChatMessage[] = data.map((session: any) => ({
          id: session.id,
          message: session.message,
          role: session.role as 'user' | 'ai',
          timestamp: new Date(session.timestamp)
        }));
        setMessages(chatMessages);
      } else {
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      addWelcomeMessage();
    }
  };

  const saveChatMessage = async (message: string, role: 'user' | 'ai') => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          message,
          role,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  };

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

    // Save user message to database
    await saveChatMessage(userMessage, 'user');

    // Prepare messages for AI (include user's proficiency level in system prompt if available)
    let systemPrompt = SYSTEM_PROMPT;
    if (profile) {
      systemPrompt += `\n\nThe user's English proficiency level is: ${profile.proficiency_level}. Their native language is: ${profile.native_language}. Adjust your responses accordingly.`;
    }

    const conversationHistory: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
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

      // Save AI message to database
      await saveChatMessage(aiResponse, 'ai');

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

  const clearChat = async () => {
    if (user) {
      try {
        // Clear chat history from database
        const { error } = await (supabase as any)
          .from('chat_sessions')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Chat Cleared",
          description: "Your chat history has been cleared.",
        });
      } catch (error) {
        console.error('Error clearing chat:', error);
        toast({
          title: "Error",
          description: "Failed to clear chat history.",
          variant: "destructive"
        });
      }
    }
    
    setMessages([]);
    addWelcomeMessage();
  };

  return {
    messages,
    sendUserMessage,
    isLoading,
    error,
    clearChat
  };
};

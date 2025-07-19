
import { useState, useEffect } from 'react';
import { OpenRouterMessage } from './useOpenRouter';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useLanguage } from './useLanguage';
import { ChatSession } from '@/types/database';

export interface ChatMessage {
  id: string;
  message: string;
  role: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  audioBlob?: Blob;
  originalText?: string;
  translatedText?: string;
  language?: string;
}

interface MessageOptions {
  language?: string;
  isNativeMode?: boolean;
  audioBlob?: Blob;
}

const SYSTEM_PROMPT = `You are a friendly, patient English teacher helping non-native speakers improve their English. Your responses should be:

1. Clear and simple - use everyday vocabulary
2. Encouraging - always praise effort and progress
3. Corrective but gentle - if you notice grammar mistakes, gently correct them by including the correct form in your response
4. Conversational - ask follow-up questions to keep the conversation going
5. Educational - provide brief explanations when helpful
6. Supportive - create a safe space for learning

Keep responses conversational and under 100 words. Always end with a question or encouragement to continue the conversation.`;

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { currentLanguage, nativeLanguage, isNativeMode } = useLanguage();

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

  const sendUserMessage = async (userMessage: string, options: MessageOptions = {}) => {
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      role: 'user',
      timestamp: new Date(),
      audioBlob: options.audioBlob,
      originalText: userMessage,
      language: options.language || currentLanguage.code
    };

    setMessages(prev => [...prev, userChatMessage]);

    // Save user message to database
    await saveChatMessage(userMessage, 'user');

    try {
      // Call backend API to get AI response
      const response = await fetch('/api/ai-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          language: options.language || currentLanguage.code,
          isNativeMode: options.isNativeMode || isNativeMode,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.message
          })),
          userProfile: profile
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiChatMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        message: data.text,
        role: 'ai',
        timestamp: new Date(),
        audioUrl: data.audioUrl
      };

      setMessages(prev => [...prev, aiChatMessage]);
      await saveChatMessage(data.text, 'ai');

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

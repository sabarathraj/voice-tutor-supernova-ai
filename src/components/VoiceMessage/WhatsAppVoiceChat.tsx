import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { VoiceRecorder } from './VoiceRecorder';
import { ChatBubble } from './ChatBubble';
import { useChat } from '@/hooks/useChat';
import { useLanguage } from '@/hooks/useLanguage';
import { Send, Globe, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WhatsAppVoiceChat = () => {
  const [textInput, setTextInput] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentLanguage, 
    nativeLanguage, 
    isNativeMode, 
    toggleLanguageMode, 
    translations 
  } = useLanguage();
  
  const { messages, sendUserMessage, isLoading, clearChat } = useChat();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (message: string, audioBlob?: Blob) => {
    if (!message.trim() || isLoading) return;
    
    setTextInput('');
    setShowVoiceRecorder(false);
    
    // Send message with language context
    await sendUserMessage(message.trim(), {
      language: currentLanguage.code,
      isNativeMode,
      audioBlob
    });
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(textInput);
  };

  const handleVoiceTranscript = (transcript: string, audioBlob?: Blob) => {
    if (transcript) {
      handleSendMessage(transcript, audioBlob);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                {translations.aiTutor}
              </h1>
              <p className="text-xs text-green-100">
                {translations.practiceConversation}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguageMode}
              className="text-white hover:bg-white/20 text-xs"
            >
              <Globe className="w-4 h-4 mr-1" />
              {isNativeMode ? translations.switchToEnglish : translations.switchToNative}
            </Button>
            
            {/* Clear Chat */}
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Language Indicator */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {isNativeMode ? nativeLanguage.nativeName : 'English'}
          </Badge>
          {isNativeMode && (
            <span className="text-xs text-green-100">
              Learning English in {nativeLanguage.nativeName}
            </span>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.message}
              role={message.role}
              timestamp={message.timestamp}
              audioUrl={message.audioUrl}
              audioBlob={message.audioBlob}
              originalText={message.originalText}
              translatedText={message.translatedText}
              language={message.language}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-card border rounded-2xl px-4 py-3 mr-4">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {translations.processing}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-white border-t">
        {showVoiceRecorder ? (
          <VoiceRecorder 
            onTranscript={handleVoiceTranscript} 
            disabled={isLoading}
          />
        ) : (
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={translations.typeMessage}
              disabled={isLoading}
              className="flex-1 rounded-full border-2 border-gray-200 focus:border-green-500"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowVoiceRecorder(true)}
              disabled={isLoading}
              className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              🎤
            </Button>
            
            <Button 
              type="submit" 
              disabled={!textInput.trim() || isLoading}
              size="icon"
              className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        <p className="text-xs text-center text-muted-foreground mt-2">
          🎯 {isNativeMode 
            ? `Learning English through ${nativeLanguage.nativeName}` 
            : 'Full English immersion mode'
          }
        </p>
      </div>
    </div>
  );
};
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { VoiceRecorder } from './VoiceRecorder';
import { ChatMessage } from './ChatMessage';
import { ApiKeyInput } from './ApiKeyInput';
import { useChat } from '@/hooks/useChat';
import { Send, Trash2 } from 'lucide-react';

export const VoiceTutorChat = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => 
    localStorage.getItem('openrouter_api_key')
  );
  const [textInput, setTextInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, sendUserMessage, isLoading, clearChat } = useChat(apiKey);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openrouter_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setTextInput('');
    await sendUserMessage(message.trim());
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(textInput);
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Voice Tutor
            </h1>
            <p className="text-sm text-muted-foreground">
              Practice English conversation with your AI teacher
            </p>
          </div>
          
          {messages.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* API Key Input */}
      <div className="flex-shrink-0 p-4">
        <ApiKeyInput apiKey={apiKey} onApiKeySet={setApiKey} />
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.message}
              role={message.role}
              timestamp={message.timestamp}
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
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t bg-gradient-to-r from-background to-muted/20">
        <div className="space-y-4">
          {/* Voice Input */}
          <div className="flex justify-center">
            <VoiceRecorder 
              onTranscript={handleVoiceTranscript} 
              disabled={isLoading || !apiKey}
            />
          </div>

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={apiKey ? "Type your message or use voice..." : "Enter API key first"}
              disabled={isLoading || !apiKey}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!textInput.trim() || isLoading || !apiKey}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            🎯 Practice pronunciation, grammar, vocabulary, and conversation skills
          </p>
        </div>
      </div>
    </div>
  );
};
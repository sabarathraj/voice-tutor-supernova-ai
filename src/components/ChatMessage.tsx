import { useState } from 'react';
import { Button } from './ui/button';
import { Volume2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  role: 'user' | 'ai';
  timestamp: Date;
}

export const ChatMessage = ({ message, role, timestamp }: ChatMessageProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8; // Slightly slower for learning
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className={cn(
      "flex w-full mb-4",
      role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
        role === 'user' 
          ? 'bg-primary text-primary-foreground ml-4' 
          : 'bg-card border mr-4'
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
            <p className="text-xs opacity-70 mt-2">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          {role === 'ai' && (
            <div className="flex flex-col gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-accent"
                onClick={isSpeaking ? stopSpeaking : speakMessage}
                title={isSpeaking ? 'Stop speaking' : 'Listen to response'}
              >
                {isSpeaking ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
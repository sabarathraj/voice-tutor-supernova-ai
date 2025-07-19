import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscript, disabled }: VoiceRecorderProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [onTranscript]);

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-2">Voice input not supported in this browser</p>
        <p className="text-sm text-muted-foreground">Try Chrome, Safari, or Edge for voice features</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant={isListening ? "voice-active" : "voice"}
        size="lg"
        className={cn(
          "w-20 h-20 rounded-full p-0 transition-all duration-300 shadow-lg",
          isListening && "shadow-xl scale-110"
        )}
        onClick={startListening}
        disabled={disabled || isListening}
      >
        {isListening ? (
          <Volume2 className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm font-medium">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </p>
        <p className="text-xs text-muted-foreground">
          {isListening ? 'Speak clearly in English' : 'Voice input powered by Web Speech API'}
        </p>
      </div>
    </div>
  );
};

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
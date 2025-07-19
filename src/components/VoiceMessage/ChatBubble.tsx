import { VoicePlayer } from './VoicePlayer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatBubbleProps {
  message: string;
  role: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  audioBlob?: Blob;
  originalText?: string;
  translatedText?: string;
  language?: string;
}

export const ChatBubble = ({
  message,
  role,
  timestamp,
  audioUrl,
  audioBlob,
  originalText,
  translatedText,
  language
}: ChatBubbleProps) => {
  const { currentLanguage, nativeLanguage } = useLanguage();
  
  const isUser = role === 'user';
  const hasAudio = audioUrl || audioBlob;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getLanguageName = (langCode: string) => {
    const lang = useLanguage().supportedLanguages.find(l => l.code === langCode);
    return lang?.nativeName || lang?.name || langCode;
  };

  return (
    <div className={cn(
      "flex w-full mb-4 animate-in slide-in-from-bottom-2",
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm relative",
        isUser 
          ? 'bg-primary text-primary-foreground ml-4' 
          : 'bg-card border mr-4'
      )}>
        {/* Language indicator for user messages */}
        {isUser && language && language !== 'en' && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 left-2 text-xs bg-background/80"
          >
            {getLanguageName(language)}
          </Badge>
        )}

        <div className="space-y-3">
          {/* Original text (for user) or main message (for AI) */}
          {originalText && isUser ? (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed font-medium">
                {originalText}
              </p>
              {translatedText && translatedText !== originalText && (
                <p className="text-xs opacity-80 italic border-t border-primary-foreground/20 pt-2">
                  English: {translatedText}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          )}

          {/* Voice player */}
          {hasAudio && (
            <VoicePlayer 
              audioUrl={audioUrl}
              audioBlob={audioBlob}
              autoPlay={!isUser}
            />
          )}

          {/* Timestamp */}
          <div className={cn(
            "flex items-center justify-end gap-1 text-xs",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            <span>{formatTime(timestamp)}</span>
            {isUser && (
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
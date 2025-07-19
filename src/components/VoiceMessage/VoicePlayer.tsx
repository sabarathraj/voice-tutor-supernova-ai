import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface VoicePlayerProps {
  audioUrl?: string;
  audioBlob?: Blob;
  duration?: number;
  className?: string;
  autoPlay?: boolean;
}

export const VoicePlayer = ({ 
  audioUrl, 
  audioBlob, 
  duration, 
  className,
  autoPlay = false 
}: VoicePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { translations } = useLanguage();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, audioBlob]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 500);
    }
  }, [autoPlay, audioUrl, audioBlob]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const getAudioSrc = () => {
    if (audioUrl) return audioUrl;
    if (audioBlob) return URL.createObjectURL(audioBlob);
    return undefined;
  };

  const audioSrc = getAudioSrc();
  if (!audioSrc) return null;

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-muted/30 rounded-lg", className)}>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        className="w-8 h-8 p-0 rounded-full"
        title={isPlaying ? translations.pauseMessage : translations.playMessage}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={restart}
        className="w-8 h-8 p-0 rounded-full"
        title="Restart"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Volume2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  level: string;
  lesson_type: string;
  title: string;
  content: any;
  order_number: number;
}

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
}

export const LessonDetail = ({ lesson, onBack, onComplete }: LessonDetailProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleComplete = async () => {
    if (!profile) return;

    setIsCompleting(true);

    try {
      // Calculate score for quiz lessons
      let score = null;
      if (lesson.lesson_type === 'quiz' && lesson.content.exercises) {
        const correctAnswers = lesson.content.exercises.filter(
          (exercise: any, index: number) => answers[index] === exercise.answer
        ).length;
        score = Math.round((correctAnswers / lesson.content.exercises.length) * 100);
      }

      // Update or create lesson progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: profile.user_id,
          lesson_id: lesson.id,
          status: 'completed',
          score,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Lesson Completed!",
        description: score ? `Great job! You scored ${score}%` : "Well done! Keep up the great work!",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson progress",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const renderVocabularyLesson = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 Vocabulary Words
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(lesson.content.vocabulary.join(', '))}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {lesson.content.vocabulary.map((word: string, index: number) => (
              <Card key={index} className="p-4 text-center hover:bg-accent cursor-pointer">
                <p className="font-semibold text-lg" onClick={() => speakText(word)}>
                  {word}
                </p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Sentences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lesson.content.examples.map((example: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(example)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <p>{example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGrammarLesson = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📝 Grammar Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lesson.content.rules.map((rule: string, index: number) => (
              <div key={index} className="p-4 bg-primary/5 rounded-lg">
                <p className="font-medium">{rule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lesson.content.examples.map((example: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(example)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <p>{example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {lesson.content.exercises && (
        <Card>
          <CardHeader>
            <CardTitle>Practice Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.content.exercises.map((exercise: any, index: number) => (
                <div key={index} className="space-y-3">
                  <p className="font-medium">{exercise.question}</p>
                  <RadioGroup
                    value={answers[index] || ''}
                    onValueChange={(value) => setAnswers({...answers, [index]: value})}
                  >
                    {exercise.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${index}-${optIndex}`} />
                        <Label htmlFor={`${index}-${optIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSpeakingLesson = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🗣️ Speaking Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-primary/5 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-3">Practice Prompt</h3>
              <p className="text-lg mb-4">{lesson.content.prompt}</p>
              <Button
                variant="outline"
                onClick={() => speakText(lesson.content.prompt)}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen to Prompt
              </Button>
            </div>

            {lesson.content.sample && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(lesson.content.sample)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <p>{lesson.content.sample}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💡 Speaking Tips:</h4>
              <ul className="text-sm space-y-1 text-yellow-800">
                <li>• Speak clearly and at a comfortable pace</li>
                <li>• Don't worry about making mistakes</li>
                <li>• Practice the sample response first</li>
                <li>• Record yourself if possible</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLessonContent = () => {
    switch (lesson.lesson_type) {
      case 'vocabulary':
        return renderVocabularyLesson();
      case 'grammar':
        return renderGrammarLesson();
      case 'speaking':
        return renderSpeakingLesson();
      default:
        return <div>Lesson type not supported</div>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{lesson.level}</Badge>
              <Badge variant="secondary">
                {lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {renderLessonContent()}

      <div className="mt-8 text-center">
        <Button 
          onClick={handleComplete} 
          disabled={isCompleting}
          size="lg"
          className="px-8"
        >
          {isCompleting ? 'Completing...' : 'Complete Lesson'}
          <CheckCircle className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Volume2, CheckCircle, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LessonDetail } from './LessonDetail';

interface Lesson {
  id: string;
  level: string;
  lesson_type: string;
  title: string;
  content: any;
  order_number: number;
  created_at: string;
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

export const LessonsPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
    fetchProgress();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('level, order_number');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', profile.user_id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return '📚';
      case 'grammar':
        return '📝';
      case 'speaking':
        return '🗣️';
      case 'quiz':
        return '❓';
      default:
        return '📖';
    }
  };

  const handleLessonComplete = () => {
    fetchProgress();
    setSelectedLesson(null);
  };

  if (selectedLesson) {
    return (
      <LessonDetail 
        lesson={selectedLesson} 
        onBack={() => setSelectedLesson(null)}
        onComplete={handleLessonComplete}
      />
    );
  }

  const filterLessons = (type: string) => {
    if (type === 'all') return lessons;
    if (type === 'my-level') return lessons.filter(l => l.level === profile?.proficiency_level);
    return lessons.filter(l => l.lesson_type === type);
  };

  const filteredLessons = filterLessons(activeTab);
  const completedCount = progress.filter(p => p.status === 'completed').length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">English Lessons</h1>
        
        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Lessons Completed</span>
                <span>{completedCount} / {lessons.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {progress.filter(p => p.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {progress.filter(p => p.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {lessons.length - progress.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Lessons</TabsTrigger>
            <TabsTrigger value="my-level">My Level</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
            <TabsTrigger value="quiz">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => {
                const lessonProgress = getLessonProgress(lesson.id);
                return (
                  <Card 
                    key={lesson.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTypeIcon(lesson.lesson_type)}</span>
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {lesson.level}
                            </Badge>
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          </div>
                        </div>
                        {getStatusIcon(lessonProgress?.status)}
                      </div>
                      <CardDescription>
                        {lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)} Lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lessonProgress?.status === 'completed' && lessonProgress.score && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Score: {lessonProgress.score}%</span>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full"
                          variant={lessonProgress?.status === 'completed' ? 'outline' : 'default'}
                        >
                          {lessonProgress?.status === 'completed' ? 'Review Lesson' : 
                           lessonProgress?.status === 'in_progress' ? 'Continue Lesson' : 
                           'Start Lesson'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredLessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later for new lessons.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

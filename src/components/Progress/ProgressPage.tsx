
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Award, Target, BookOpen, MessageCircle } from 'lucide-react';

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  currentStreak: number;
  totalSessions: number;
  recentSessions: any[];
}

export const ProgressPage = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
    currentStreak: 0,
    totalSessions: 0,
    recentSessions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressStats();
  }, [profile]);

  const fetchProgressStats = async () => {
    if (!profile) return;

    try {
      // Fetch lesson progress
      const { data: lessonProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', profile.user_id);

      // Fetch total lessons count
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id');

      // Fetch recent chat sessions
      const { data: recentSessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('timestamp', { ascending: false })
        .limit(10);

      const completedLessons = lessonProgress?.filter(p => p.status === 'completed') || [];
      const averageScore = completedLessons.length > 0 
        ? completedLessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) / completedLessons.length
        : 0;

      setStats({
        totalLessons: lessons?.length || 0,
        completedLessons: completedLessons.length,
        averageScore: Math.round(averageScore),
        currentStreak: profile.current_streak,
        totalSessions: profile.total_sessions,
        recentSessions: recentSessions || []
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">Loading progress...</div>
      </div>
    );
  }

  const progressPercentage = stats.totalLessons > 0 
    ? (stats.completedLessons / stats.totalLessons) * 100 
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Learning Progress</h1>
        <p className="text-muted-foreground">
          Track your journey and celebrate your achievements!
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                <p className="text-3xl font-bold">{stats.completedLessons}</p>
                <p className="text-sm text-muted-foreground">out of {stats.totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">quiz performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {stats.completedLessons} / {stats.totalLessons} lessons
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progressPercentage.toFixed(1)}% of all lessons completed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Beginner Level</h4>
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-sm text-muted-foreground">lessons available</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Intermediate Level</h4>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-sm text-muted-foreground">lessons available</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Advanced Level</h4>
                <p className="text-2xl font-bold text-green-600">3</p>
                <p className="text-sm text-muted-foreground">lessons available</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg text-center ${stats.totalSessions >= 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
              <div className="text-2xl mb-2">🎯</div>
              <p className="font-semibold text-sm">First Steps</p>
              <p className="text-xs text-muted-foreground">Complete first session</p>
              {stats.totalSessions >= 1 && <Badge variant="secondary" className="mt-2">Earned!</Badge>}
            </div>

            <div className={`p-4 rounded-lg text-center ${stats.currentStreak >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
              <div className="text-2xl mb-2">🔥</div>
              <p className="font-semibold text-sm">On Fire</p>
              <p className="text-xs text-muted-foreground">3-day streak</p>
              {stats.currentStreak >= 3 && <Badge variant="secondary" className="mt-2">Earned!</Badge>}
            </div>

            <div className={`p-4 rounded-lg text-center ${stats.completedLessons >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
              <div className="text-2xl mb-2">📚</div>
              <p className="font-semibold text-sm">Scholar</p>
              <p className="text-xs text-muted-foreground">Complete 5 lessons</p>
              {stats.completedLessons >= 5 && <Badge variant="secondary" className="mt-2">Earned!</Badge>}
            </div>

            <div className={`p-4 rounded-lg text-center ${stats.averageScore >= 80 ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
              <div className="text-2xl mb-2">⭐</div>
              <p className="font-semibold text-sm">Excellent</p>
              <p className="text-xs text-muted-foreground">80% average score</p>
              {stats.averageScore >= 80 && <Badge variant="secondary" className="mt-2">Earned!</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${session.role === 'user' ? 'bg-primary/10' : 'bg-blue-100'}`}>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {session.role === 'user' ? 'You said:' : 'AI responded:'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {session.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity yet.</p>
              <p className="text-sm text-muted-foreground">Start a conversation with your AI tutor!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

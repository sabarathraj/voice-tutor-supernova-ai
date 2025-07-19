
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Target,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import { VoiceTutorChat } from '@/components/VoiceTutorChat';
import { LessonsPage } from '@/components/Lessons/LessonsPage';
import { ProgressPage } from '@/components/Progress/ProgressPage';
import { SettingsPage } from '@/components/Settings/SettingsPage';

type ActivePage = 'dashboard' | 'chat' | 'lessons' | 'progress' | 'settings';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  if (!profile) return null;

  if (activePage === 'chat') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            onClick={() => setActivePage('dashboard')}
            className="mb-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <div className="flex-1">
          <VoiceTutorChat />
        </div>
      </div>
    );
  }

  if (activePage === 'lessons') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            onClick={() => setActivePage('dashboard')}
            className="mb-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <LessonsPage />
        </div>
      </div>
    );
  }

  if (activePage === 'progress') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            onClick={() => setActivePage('dashboard')}
            className="mb-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <ProgressPage />
        </div>
      </div>
    );
  }

  if (activePage === 'settings') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            onClick={() => setActivePage('dashboard')}
            className="mb-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <SettingsPage />
        </div>
      </div>
    );
  }

  const dailyProgress = Math.min((profile.total_sessions % profile.daily_goal) / profile.daily_goal * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-muted-foreground">
                Continue your English learning journey
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {profile.proficiency_level.charAt(0).toUpperCase() + profile.proficiency_level.slice(1)}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{profile.current_streak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{profile.total_sessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Goal</p>
                    <p className="text-2xl font-bold">{profile.daily_goal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-lg font-semibold capitalize">{profile.proficiency_level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Sessions completed today</span>
                  <span>{Math.min(profile.total_sessions % profile.daily_goal, profile.daily_goal)} / {profile.daily_goal}</span>
                </div>
                <Progress value={dailyProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {dailyProgress >= 100 ? 'Great job! You\'ve completed your daily goal!' : 'Keep going! You\'re doing great!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActivePage('chat')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Talk to AI Tutor</CardTitle>
              <CardDescription>
                Practice conversation with your AI English teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Conversation</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActivePage('lessons')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Take Lessons</CardTitle>
              <CardDescription>
                Structured lessons for vocabulary, grammar, and speaking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View Lessons</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActivePage('progress')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>View Progress</CardTitle>
              <CardDescription>
                Track your learning journey and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">See Progress</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActivePage('settings')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Open Settings</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Tips for Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-2">🎯 Daily Practice</h4>
                <p className="text-sm text-muted-foreground">
                  Consistency is key! Try to practice for at least 10 minutes every day.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">🗣️ Speaking Practice</h4>
                <p className="text-sm text-muted-foreground">
                  Don't be afraid to make mistakes. Practice speaking out loud regularly.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">📚 Learn New Words</h4>
                <p className="text-sm text-muted-foreground">
                  Try to learn 3-5 new words each day and use them in sentences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

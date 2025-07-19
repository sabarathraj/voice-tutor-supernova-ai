
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Globe, Target, LogOut, Trash2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' }
];

export const SettingsPage = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    native_language: profile?.native_language || '',
    proficiency_level: profile?.proficiency_level || 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    daily_goal: profile?.daily_goal || 5,
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile updated!",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground">
          Customize your learning experience and manage your account
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and learning preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="native-language">Native Language</Label>
              <Select 
                value={formData.native_language} 
                onValueChange={(value) => setFormData({ ...formData, native_language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your native language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>English Proficiency Level</Label>
              <RadioGroup 
                value={formData.proficiency_level} 
                onValueChange={(value) => setFormData({ ...formData, proficiency_level: value as 'beginner' | 'intermediate' | 'advanced' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="settings-beginner" />
                  <Label htmlFor="settings-beginner">Beginner - Just starting to learn English</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="settings-intermediate" />
                  <Label htmlFor="settings-intermediate">Intermediate - Can have basic conversations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="settings-advanced" />
                  <Label htmlFor="settings-advanced">Advanced - Fluent with room for improvement</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-goal">Daily Learning Goal</Label>
              <Select 
                value={formData.daily_goal.toString()} 
                onValueChange={(value) => setFormData({ ...formData, daily_goal: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 sessions per day</SelectItem>
                  <SelectItem value="5">5 sessions per day</SelectItem>
                  <SelectItem value="10">10 sessions per day</SelectItem>
                  <SelectItem value="15">15 sessions per day</SelectItem>
                  <SelectItem value="20">20 sessions per day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpdateProfile} 
              disabled={isUpdating}
              className="w-full md:w-auto"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Preferences
            </CardTitle>
            <CardDescription>
              Customize how you interact with the AI tutor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-input">Voice Input</Label>
                <p className="text-sm text-muted-foreground">
                  Enable microphone for speech-to-text input
                </p>
              </div>
              <Switch 
                id="voice-input"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-speak">Auto-speak AI Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play AI responses with text-to-speech
                </p>
              </div>
              <Switch 
                id="auto-speak"
                checked={autoSpeak}
                onCheckedChange={setAutoSpeak}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Translation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Translation
            </CardTitle>
            <CardDescription>
              Configure translation and multilingual features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2">🌍 Translation Feature</h4>
              <p className="text-sm text-blue-800 mb-3">
                Get AI feedback translated to your native language for better understanding.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Current native language:</strong> {LANGUAGES.find(l => l.code === profile.native_language)?.name || 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Sign Out</h4>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-semibold text-red-900">Reset Progress</h4>
                <p className="text-sm text-red-700">
                  Clear all lesson progress and chat history (this cannot be undone)
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

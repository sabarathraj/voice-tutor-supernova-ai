
// Database types for our application
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  native_language: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  daily_goal: number;
  current_streak: number;
  total_sessions: number;
  last_session_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lesson_type: 'vocabulary' | 'grammar' | 'speaking' | 'quiz';
  title: string;
  content: any;
  order_number: number;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'ai';
  timestamp: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  date: string;
  achieved: boolean;
  created_at: string;
}

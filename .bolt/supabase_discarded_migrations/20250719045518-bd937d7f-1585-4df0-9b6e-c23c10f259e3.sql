
-- Create enum types for better data integrity
CREATE TYPE public.proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.lesson_type AS ENUM ('vocabulary', 'grammar', 'speaking', 'quiz');
CREATE TYPE public.lesson_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Update profiles table to match requirements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS proficiency_level proficiency_level DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_date DATE;

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level proficiency_level NOT NULL,
  lesson_type lesson_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_lesson_progress table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id),
  status lesson_status NOT NULL DEFAULT 'not_started',
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_type, date)
);

-- Enable RLS on new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons (public read access)
CREATE POLICY "Anyone can view lessons" 
ON public.lessons 
FOR SELECT 
USING (true);

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view their own lesson progress" 
ON public.user_lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson progress" 
ON public.user_lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.user_lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample lessons for each level
INSERT INTO public.lessons (level, lesson_type, title, content, order_number) VALUES
-- Beginner Lessons
('beginner', 'vocabulary', 'Basic Greetings', '{"vocabulary": ["hello", "goodbye", "please", "thank you", "excuse me"], "examples": ["Hello, how are you?", "Goodbye, see you later!", "Please help me.", "Thank you very much!", "Excuse me, where is the bathroom?"]}', 1),
('beginner', 'grammar', 'Present Simple Tense', '{"rules": ["I/You/We/They + verb", "He/She/It + verb + s"], "examples": ["I eat breakfast.", "She works every day.", "They play football."], "exercises": [{"question": "I ___ to school every day.", "options": ["go", "goes", "going"], "answer": "go"}]}', 2),
('beginner', 'speaking', 'Introduce Yourself', '{"prompt": "Practice introducing yourself. Say your name, where you are from, and what you do.", "sample": "Hi, my name is John. I am from India. I am a student."}', 3),

-- Intermediate Lessons
('intermediate', 'vocabulary', 'Business English', '{"vocabulary": ["meeting", "deadline", "colleague", "presentation", "schedule"], "examples": ["We have a meeting at 3 PM.", "The deadline is tomorrow.", "My colleague is very helpful."]}', 1),
('intermediate', 'grammar', 'Past Perfect Tense', '{"rules": ["had + past participle"], "examples": ["I had finished my work before he arrived.", "She had studied English for 5 years."], "exercises": [{"question": "By the time I arrived, they ___ already left.", "options": ["have", "had", "has"], "answer": "had"}]}', 2),
('intermediate', 'speaking', 'Describe Your Day', '{"prompt": "Describe what you did yesterday from morning to evening.", "sample": "Yesterday morning, I woke up at 7 AM. Then I had breakfast and went to work..."}', 3),

-- Advanced Lessons
('advanced', 'vocabulary', 'Academic English', '{"vocabulary": ["hypothesis", "methodology", "analysis", "synthesis", "critique"], "examples": ["The hypothesis was proven correct.", "Our methodology involved multiple approaches."]}', 1),
('advanced', 'grammar', 'Conditional Sentences', '{"rules": ["If + present, will + verb", "If + past, would + verb", "If + past perfect, would have + verb"], "examples": ["If it rains, I will stay home.", "If I had money, I would travel."]}', 2),
('advanced', 'speaking', 'Express Opinions', '{"prompt": "Give your opinion on a current topic and support it with reasons.", "sample": "In my opinion, technology has greatly improved our lives because..."}', 3);

-- Create trigger for updating user lesson progress timestamp
CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update user streak and session count
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total sessions and streak when a chat session is created
  IF NEW.role = 'user' THEN
    UPDATE public.profiles 
    SET 
      total_sessions = total_sessions + 1,
      current_streak = CASE 
        WHEN last_session_date = CURRENT_DATE THEN current_streak
        WHEN last_session_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
        ELSE 1
      END,
      last_session_date = CURRENT_DATE,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user stats
CREATE TRIGGER on_chat_session_created
  AFTER INSERT ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

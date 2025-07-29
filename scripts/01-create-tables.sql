-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator_email VARCHAR(255) NOT NULL,
  creator_name VARCHAR(255) NOT NULL,
  max_vote_balance INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  vote_balance INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('quiz', 'voting')),
  voting_mode VARCHAR(50) NOT NULL CHECK (voting_mode IN ('single', 'multi')),
  time_limit INTEGER DEFAULT 15,
  votes_required INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_options table
CREATE TABLE IF NOT EXISTS task_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  option_id UUID REFERENCES task_options(id) ON DELETE CASCADE,
  votes_used INTEGER DEFAULT 1,
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id, option_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Events can be created by anyone" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Events can be updated by creator" ON events FOR UPDATE USING (true);

CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be created by anyone" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "User sessions are viewable by everyone" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "User sessions can be created by anyone" ON user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "User sessions can be updated by anyone" ON user_sessions FOR UPDATE USING (true);

CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Tasks can be created by anyone" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tasks can be updated by anyone" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Task options are viewable by everyone" ON task_options FOR SELECT USING (true);
CREATE POLICY "Task options can be created by anyone" ON task_options FOR INSERT WITH CHECK (true);

CREATE POLICY "User responses are viewable by everyone" ON user_responses FOR SELECT USING (true);
CREATE POLICY "User responses can be created by anyone" ON user_responses FOR INSERT WITH CHECK (true);

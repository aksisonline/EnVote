-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS user_responses;
DROP TABLE IF EXISTS task_options;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;

-- Drop all existing indexes
DROP INDEX IF EXISTS idx_events_name;
DROP INDEX IF EXISTS idx_user_sessions_event;
DROP INDEX IF EXISTS idx_tasks_event;
DROP INDEX IF EXISTS idx_task_options_task;
DROP INDEX IF EXISTS idx_user_responses_user;
DROP INDEX IF EXISTS idx_user_responses_task;

-- Create events table
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  creator_email TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  max_vote_balance INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  vote_balance INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(user_id, event_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'voting')),
  voting_mode TEXT NOT NULL CHECK (voting_mode IN ('single', 'multi')),
  time_limit INTEGER DEFAULT 15,
  votes_required INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create task_options table
CREATE TABLE task_options (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT 0,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create user_responses table
CREATE TABLE user_responses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  votes_used INTEGER DEFAULT 1,
  responded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES task_options(id) ON DELETE CASCADE,
  UNIQUE(user_id, task_id, option_id)
);

-- Create indexes for better performance
CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_user_sessions_event ON user_sessions(event_id);
CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_task_options_task ON task_options(task_id);
CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_task ON user_responses(task_id);

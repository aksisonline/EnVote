-- Cleanup script to delete data older than 15 days
-- This should be run as a cron job

-- Delete old user responses (older than 15 days)
DELETE FROM user_responses 
WHERE responded_at < datetime('now', '-15 days');

-- Delete old user sessions (older than 15 days)
DELETE FROM user_sessions 
WHERE joined_at < datetime('now', '-15 days');

-- Delete old tasks from inactive events (older than 15 days)
DELETE FROM tasks 
WHERE event_id IN (
  SELECT id FROM events 
  WHERE is_active = 0 AND updated_at < datetime('now', '-15 days')
) AND created_at < datetime('now', '-15 days');

-- Delete old task options from deleted tasks
DELETE FROM task_options 
WHERE task_id NOT IN (SELECT id FROM tasks);

-- Delete old inactive events (older than 15 days)
DELETE FROM events 
WHERE is_active = 0 AND updated_at < datetime('now', '-15 days');

-- Delete orphaned users (no events created and no recent sessions)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT creator_email FROM events
) AND id NOT IN (
  SELECT DISTINCT user_id FROM user_sessions 
  WHERE joined_at > datetime('now', '-15 days')
);

-- Vacuum to reclaim space
VACUUM;

-- Analyze to update statistics
ANALYZE;

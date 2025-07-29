-- Cleanup script to remove data older than 15 days
-- Run this daily via cron job

-- Delete old user responses (15+ days old)
DELETE FROM user_responses 
WHERE responded_at < datetime('now', '-15 days');

-- Delete inactive user sessions (15+ days old)
DELETE FROM user_sessions 
WHERE joined_at < datetime('now', '-15 days') 
AND is_active = false;

-- Delete tasks from inactive events (15+ days old)
DELETE FROM tasks 
WHERE event_id IN (
  SELECT id FROM events 
  WHERE is_active = false 
  AND updated_at < datetime('now', '-15 days')
);

-- Delete task options for deleted tasks
DELETE FROM task_options 
WHERE task_id NOT IN (SELECT id FROM tasks);

-- Delete inactive events (15+ days old)
DELETE FROM events 
WHERE is_active = false 
AND updated_at < datetime('now', '-15 days');

-- Delete users with no active sessions or events
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT creator_id FROM events WHERE creator_id IS NOT NULL
  UNION
  SELECT DISTINCT user_id FROM user_sessions WHERE is_active = true
);

-- Vacuum and analyze to reclaim space and update statistics
VACUUM;
ANALYZE;

-- Log cleanup completion
INSERT INTO cleanup_log (cleaned_at, description) 
VALUES (datetime('now'), 'Automated cleanup completed - removed data older than 15 days');

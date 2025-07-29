# Database Migrations

This directory contains D1 database migrations for the EnVote application.

## Migration Files

- `0001_initial_schema.sql` - Creates all initial tables and indexes

## How to Apply Migrations

### Quick Start
Run the migration script to apply to both local and remote databases:
```bash
./scripts/apply-migrations.sh
```

### Manual Commands

**Apply to local database:**
```bash
npx wrangler d1 migrations apply envote-db --local
```

**Apply to remote database:**
```bash
npx wrangler d1 migrations apply envote-db --remote
```

**List unapplied migrations:**
```bash
npx wrangler d1 migrations list envote-db --local
npx wrangler d1 migrations list envote-db --remote
```

## Database Schema

The migration creates the following tables:
- `events` - Event information
- `users` - User accounts  
- `user_sessions` - User participation in events
- `tasks` - Quiz/voting tasks within events
- `task_options` - Answer options for tasks
- `user_responses` - User responses to tasks

## Development Workflow

1. Make schema changes by creating new migration files
2. Apply migrations to local database for testing
3. Apply migrations to remote database for production
4. Keep local and remote databases in sync using migrations

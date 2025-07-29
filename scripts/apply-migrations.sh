#!/bin/bash

echo "=== D1 Database Migration Script ==="
echo "This will apply migrations to sync local and remote databases"
echo ""

# Function to apply migrations
apply_migrations() {
    local env_flag="$1"
    local env_name="$2"
    
    echo "Applying migrations to $env_name database..."
    
    # List unapplied migrations first
    echo "Checking for unapplied migrations on $env_name:"
    npx wrangler d1 migrations list envote-db $env_flag
    
    echo ""
    echo "Applying migrations to $env_name database..."
    npx wrangler d1 migrations apply envote-db $env_flag
    
    echo ""
    echo "Verifying $env_name database after migration:"
    npx wrangler d1 execute envote-db $env_flag --command=".tables"
    
    echo ""
    echo "Checking users table structure on $env_name:"
    npx wrangler d1 execute envote-db $env_flag --command="PRAGMA table_info(users);"
    
    echo ""
}

# Ask which environment to migrate
echo "Which database do you want to migrate?"
echo "1) Local database only"
echo "2) Remote database only"  
echo "3) Both local and remote"
read -p "Enter your choice (1, 2, or 3): " choice

case $choice in
    1)
        apply_migrations "--local" "LOCAL"
        ;;
    2)
        apply_migrations "--remote" "REMOTE"
        ;;
    3)
        echo "Applying to both databases..."
        apply_migrations "--local" "LOCAL"
        echo ""
        echo "=================================="
        echo ""
        apply_migrations "--remote" "REMOTE"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=== Migration completed! ==="

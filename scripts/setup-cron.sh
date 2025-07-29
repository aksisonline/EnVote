#!/bin/bash

# Setup script for automated data cleanup
# This script sets up a cron job to run the cleanup daily at 2 AM

echo "Setting up EnVote data cleanup cron job..."

# Create the cleanup log table if it doesn't exist
wrangler d1 execute envote-db --command="
CREATE TABLE IF NOT EXISTS cleanup_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cleaned_at TEXT NOT NULL,
  description TEXT
);"

# Create the cleanup script
cat > /tmp/envote-cleanup.sh << 'EOF'
#!/bin/bash
# EnVote automated cleanup script
# This script runs the SQL cleanup and logs the results

LOG_FILE="/var/log/envote-cleanup.log"
SQL_FILE="/path/to/your/project/scripts/02-cleanup-old-data.sql"

echo "$(date): Starting EnVote cleanup..." >> $LOG_FILE

# Run the cleanup SQL script
wrangler d1 execute envote-db --file="$SQL_FILE" >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "$(date): Cleanup completed successfully" >> $LOG_FILE
else
    echo "$(date): Cleanup failed with error code $?" >> $LOG_FILE
fi

echo "$(date): Cleanup process finished" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE
EOF

# Make the script executable
chmod +x /tmp/envote-cleanup.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /tmp/envote-cleanup.sh") | crontab -

echo "Cron job setup complete. The database will be cleaned up daily at 2 AM."
echo "Cleanup logs will be stored in /var/log/envote-cleanup.log"

# Create initial log file
touch /var/log/envote-cleanup.log
chmod 644 /var/log/envote-cleanup.log

echo "Setup finished. You can check the cron job with: crontab -l"

# Alternative: Using GitHub Actions (if using GitHub)
cat > .github/workflows/cleanup.yml << 'EOF'
name: Database Cleanup

on:
  schedule:
    # Runs daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install Wrangler
        run: npm install -g wrangler
        
      - name: Authenticate Wrangler
        run: echo "${{ secrets.CLOUDFLARE_API_TOKEN }}" | wrangler auth api-token
        
      - name: Run Database Cleanup
        run: wrangler d1 execute envote-db --file=./scripts/02-cleanup-old-data.sql
        
      - name: Log Cleanup
        run: echo "Database cleanup completed at $(date)"
EOF

echo "GitHub Actions workflow created at .github/workflows/cleanup.yml"
echo "Make sure to add CLOUDFLARE_API_TOKEN to your GitHub repository secrets."

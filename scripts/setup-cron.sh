#!/bin/bash

# Setup cron job to clean up old data every day at 2 AM
# This script should be run on your server or CI/CD pipeline

# Create the cleanup script
cat > /tmp/envote-cleanup.sh << 'EOF'
#!/bin/bash

# Set your database details
DB_NAME="envote-db"
WRANGLER_CONFIG_PATH="/path/to/your/wrangler.toml"

# Run the cleanup SQL script
wrangler d1 execute $DB_NAME --file=/path/to/scripts/02-cleanup-old-data.sql

# Log the cleanup
echo "$(date): EnVote database cleanup completed" >> /var/log/envote-cleanup.log
EOF

# Make the script executable
chmod +x /tmp/envote-cleanup.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /tmp/envote-cleanup.sh") | crontab -

echo "Cron job setup complete. The database will be cleaned up daily at 2 AM."
echo "Cleanup logs will be stored in /var/log/envote-cleanup.log"

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

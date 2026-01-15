#!/bin/bash

# Bash script to refresh Ethereal test email credentials

echo ""
echo "🔄 Refreshing test email credentials..."
echo ""

# Step 1: Generate new credentials and update config files
echo "Step 1: Generating new Ethereal account..."
cd backend
node setup-test-email.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to generate new credentials"
    cd ..
    exit 1
fi

cd ..

# Step 2: Rebuild and restart backend
echo ""
echo "Step 2: Rebuilding and restarting backend..."
docker-compose up -d --build backend

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All done! Backend is running with new email credentials."
    echo ""
else
    echo ""
    echo "❌ Failed to restart backend"
    exit 1
fi


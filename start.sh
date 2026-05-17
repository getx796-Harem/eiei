#!/bin/bash

# TicketMaster Start Script
echo "Initializing System..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check for environment variables
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found. Please create one with VITE_DISCORD_TOKEN and VITE_GUILD_ID."
    echo "Creating a template .env file..."
    echo "VITE_DISCORD_TOKEN=" > .env
    echo "VITE_GUILD_ID=" >> .env
    echo "GEMINI_API_KEY=" >> .env
fi

echo "Starting Support Terminal..."
npm run dev

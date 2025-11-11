#!/bin/bash
# Simple HTTP server startup script
# This script starts a local web server to properly serve the dashboard

echo "🌊 Starting Hydraulic Dam Dashboard Server..."
echo ""
echo "Choose your preferred method:"
echo "1. Python (simple, built-in)"
echo "2. Node.js (http-server, faster)"
echo ""
read -p "Enter choice (1 or 2, default 1): " choice

if [ "$choice" = "2" ]; then
    echo "Starting Node.js http-server on http://localhost:8080"
    npx http-server -p 8080 -c-1 -o
else
    echo "Starting Python HTTP server on http://localhost:8080"
    echo "Press Ctrl+C to stop the server"
    echo ""
    echo "Open your browser to: http://localhost:8080"
    python3 -m http.server 8080
fi

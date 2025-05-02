#!/bin/bash

# Function to handle exit
cleanup() {
  echo "Stopping services..."
  docker stop url-shortener-redis
  docker rm url-shortener-redis
  kill $API_PID
  kill $WEB_PID
  exit 0
}

# Set up trap to catch SIGINT (Ctrl+C)
trap cleanup SIGINT

# Start Redis with Docker
echo "Starting Redis..."
docker run --name url-shortener-redis -p 6379:6379 -d redis:7.2-alpine

# Check if Redis started successfully
if [ $? -ne 0 ]; then
  echo "Failed to start Redis. Exiting."
  exit 1
fi

# Wait for Redis to be ready
sleep 2

# Start backend API in the background
echo "Starting API server..."
cd apps/api
npm run dev &
API_PID=$!
cd ..

# Wait for API to start
sleep 5

# Start web frontend in the background
echo "Starting web server..."
cd web
npm run dev &
WEB_PID=$!
cd ..

echo "All services are running!"
echo "Web: http://localhost:3000"
echo "API: http://localhost:3001"
echo "Press Ctrl+C to stop all services"

# Keep script running
wait
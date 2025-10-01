#!/bin/bash

# LANT-v3 Start Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Please run ./install.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if port 5000 is available
if command_exists lsof; then
    if lsof -ti:5000 >/dev/null 2>&1; then
        print_status "Port 5000 is in use. Attempting to free it..."
        lsof -ti:5000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Check if Ollama is running
if command_exists ollama; then
    if ! ollama list >/dev/null 2>&1; then
        print_status "Starting Ollama service..."
        if command_exists systemctl; then
            sudo systemctl start ollama 2>/dev/null || true
        elif command_exists service; then
            sudo service ollama start 2>/dev/null || true
        else
            print_status "Please start Ollama manually: 'ollama serve'"
            print_status "Starting Ollama in background..."
            ollama serve &
            sleep 3
        fi
    fi
    print_success "Ollama is running"
fi

# Start the application
print_status "Starting LANT-v3..."
print_status "Application will be available at: http://localhost:5000"
print_status "Press Ctrl+C to stop the application"
echo ""

# Start Flask application
python app.py
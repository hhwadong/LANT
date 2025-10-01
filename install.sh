#!/bin/bash

# LANT-v3 Installation Script
# This script sets up the LANT-v3 learning assistant

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python() {
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi

    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
        print_error "Python 3.8 or higher is required. Found version $PYTHON_VERSION"
        exit 1
    fi

    print_success "Python $PYTHON_VERSION found"
}

# Function to check Node.js
check_nodejs() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

    if [ "$NODE_MAJOR" -lt 16 ]; then
        print_error "Node.js 16 or higher is required. Found version $NODE_VERSION"
        exit 1
    fi

    print_success "Node.js $NODE_VERSION found"
}

# Function to check npm
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION found"
}

# Function to check Ollama
check_ollama() {
    if ! command_exists ollama; then
        print_warning "Ollama is not installed. AI features will not work without it."
        print_warning "Please install Ollama from: https://ollama.com/"
        read -p "Press Enter to continue without Ollama, or Ctrl+C to exit..."
        return
    fi

    # Check if Ollama is running
    if ! ollama list >/dev/null 2>&1; then
        print_warning "Ollama is not running. Starting Ollama service..."

        # Try to start Ollama
        if command_exists systemctl; then
            sudo systemctl start ollama || print_warning "Could not start Ollama with systemctl"
        elif command_exists service; then
            sudo service ollama start || print_warning "Could not start Ollama with service"
        else
            print_warning "Please start Ollama manually: 'ollama serve'"
        fi

        sleep 2
    fi

    print_success "Ollama is running"
}

# Function to install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."

    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found. Please ensure you're in the project root."
        exit 1
    fi

    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install requirements
    pip install -r requirements.txt

    print_success "Python dependencies installed"
}

# Function to install Node.js dependencies
install_node_deps() {
    print_status "Installing Node.js dependencies..."

    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please ensure you're in the project root."
        exit 1
    fi

    npm install

    print_success "Node.js dependencies installed"
}

# Function to build React app
build_react_app() {
    print_status "Building React application..."

    # Check if we're in a virtual environment and deactivate it temporarily
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        deactivate
        BUILD_IN_VENV=false
    else
        BUILD_IN_VENV=true
    fi

    # Build the React app
    npm run build

    # Reactivate virtual environment if it was active
    if [ "$BUILD_IN_VENV" = false ]; then
        source venv/bin/activate
    fi

    print_success "React application built successfully"
}

# Function to install Ollama models
install_ollama_models() {
    if command_exists ollama; then
        print_status "Installing Ollama models..."

        # Install recommended models
        models=("qwen2.5-coder:3b-instruct" "codellama:7b")

        for model in "${models[@]}"; do
            print_status "Installing $model..."
            if ollama pull "$model"; then
                print_success "$model installed successfully"
            else
                print_warning "Failed to install $model. You can install it later with: ollama pull $model"
            fi
        done
    else
        print_warning "Skipping Ollama model installation (Ollama not found)"
    fi
}

# Function to create start script
create_start_script() {
    print_status "Creating start script..."

    cat > start.sh << 'EOF'
#!/bin/bash

# LANT-v3 Start Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Virtual environment not found. Please run ./install.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if Ollama is running
if command_exists ollama; then
    if ! ollama list >/dev/null 2>&1; then
        print_status "Starting Ollama service..."
        ollama serve &
        sleep 3
    fi
fi

# Start the application
print_status "Starting LANT-v3..."
print_status "Application will be available at: http://localhost:5000"
print_status "Press Ctrl+C to stop the application"

python app.py
EOF

    chmod +x start.sh

    print_success "Start script created"
}

# Function to create requirements.txt if it doesn't exist
create_requirements() {
    if [ ! -f "requirements.txt" ]; then
        print_status "Creating requirements.txt..."

        cat > requirements.txt << 'EOF'
Flask==2.3.3
Flask-CORS==4.0.0
requests==2.31.0
python-dotenv==1.0.0
werkzeug==2.3.7
EOF

        print_success "requirements.txt created"
    fi
}

# Main installation process
main() {
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    LANT-v3 Installer                       │"
    echo "│            Learning Assistant & Note-taking Tool             │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""

    print_status "Starting installation process..."

    # Check prerequisites
    print_status "Checking prerequisites..."
    check_python
    check_nodejs
    check_npm
    check_ollama

    # Create requirements.txt if needed
    create_requirements

    # Install dependencies
    install_python_deps
    install_node_deps

    # Build React app
    build_react_app

    # Install AI models
    install_ollama_models

    # Create start script
    create_start_script

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                     Installation Complete                    │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    print_success "LANT-v3 has been successfully installed!"
    echo ""
    print_status "To start the application:"
    echo "  ./start.sh"
    echo ""
    print_status "The application will be available at:"
    echo "  http://localhost:5000"
    echo ""
    print_status "For troubleshooting, check the README.md file."
    echo ""

    # Ask if user wants to start the application now
    read -p "Would you like to start LANT-v3 now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./start.sh
    fi
}

# Run main function
main "$@"
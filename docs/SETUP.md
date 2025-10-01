# Setup Guide

This guide provides detailed instructions for setting up LANT-v3 on different platforms.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or Ubuntu 20.04
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 22.04+
- **RAM**: 16GB or higher
- **Storage**: 5GB free space
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher

## Installation Steps

### Step 1: Install Python

#### Windows
1. Download Python from [python.org](https://python.org)
2. Run the installer
3. Check "Add Python to PATH" during installation
4. Verify installation:
   ```cmd
   python --version
   ```

#### macOS
```bash
# Using Homebrew (recommended)
brew install python3

# Or download from python.org
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### Step 2: Install Node.js

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org)
2. Run the installer
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### Ubuntu/Debian
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Or using snap
sudo snap install node --classic
```

### Step 3: Install Ollama

#### Windows
1. Download Ollama from [ollama.com](https://ollama.com)
2. Run the installer
3. Start Ollama service

#### macOS
```bash
# Using Homebrew
brew install ollama

# Or download from ollama.com
```

#### Ubuntu/Debian
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 4: Clone and Setup LANT-v3

```bash
# Clone the repository
git clone https://github.com/your-username/LANT-v3.git
cd LANT-v3

# Make scripts executable (Unix systems)
chmod +x install.sh start.sh

# Run the automatic installer
./install.sh
```

### Step 5: Download AI Models

```bash
# Start Ollama service (if not running)
ollama serve

# Download recommended models
ollama pull qwen2.5-coder:3b-instruct
ollama pull codellama:7b

# Optional: Additional models
ollama pull qwen2.5-coder:7b-instruct
ollama pull deepseek-coder:6.7b-instruct
```

### Step 6: Start the Application

```bash
# Start LANT-v3
./start.sh

# Or manually:
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend (development mode)
npm start
```

## Manual Installation

If the automatic installer fails, you can install manually:

### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Build for production
npm run build
```

## Platform-Specific Notes

### Windows
- Run PowerShell as Administrator if you encounter permission issues
- Windows Defender may flag the application - add an exception if needed
- Use WSL2 for better performance if available

### macOS
- Allow the application in System Preferences > Security & Privacy if blocked
- Use Rosetta 2 on Apple Silicon for better compatibility
- Enable Python in Terminal settings if using the system Python

### Linux
- Install additional system packages if needed:
  ```bash
  sudo apt install build-essential python3-dev
  ```
- Ensure proper permissions for installation scripts
- Use a virtual environment to avoid system conflicts

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Python Module Not Found
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Node.js Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Ollama Issues
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
# macOS/Linux
brew services restart ollama
# Ubuntu
sudo systemctl restart ollama
# Windows
Restart-Service -Name "ollama" -Force
```

### Memory Issues
- Use smaller AI models (3B instead of 7B)
- Close other applications
- Increase system swap space (Linux)
- Restart Ollama service to clear cache

## Development Setup

For developers who want to contribute or modify the code:

```bash
# Clone the repository
git clone https://github.com/your-username/LANT-v3.git
cd LANT-v3

# Install development dependencies
pip install -r requirements.txt
npm install

# Set up development environment
cp .env.example .env
# Edit .env with your settings

# Run in development mode
# Terminal 1
python app.py

# Terminal 2
npm start
```

## Verification

To verify your installation:

1. **Backend**: Visit `http://localhost:5000/api/health`
2. **Frontend**: Visit `http://localhost:3000` (dev) or `http://localhost:5000` (production)
3. **AI Models**: Run `ollama list` to see installed models
4. **File Upload**: Try uploading a document to test the system

## Next Steps

After successful installation:

1. Read the [API Documentation](API.md)
2. Check the [Project Structure](PROJECT_STRUCTURE.md)
3. Review [Testing Guidelines](TESTING.md)
4. Explore the [Development Guide](DEVELOPMENT_GUIDE.md)
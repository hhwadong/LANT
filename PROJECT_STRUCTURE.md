# LANT-v3 Project Structure

## 📁 Directory Overview

```
LANT-v3/
├── 📄 Core Application Files
│   ├── app.py                    # Flask backend web application
│   ├── lant.py                   # Core LANT functionality (CLI)
│   ├── requirements.txt          # Python dependencies
│   ├── package.json              # Node.js dependencies & scripts
│   ├── package-lock.json         # Locked Node.js dependencies
│   │
├── 📜 Documentation
│   ├── README.md                  # Project overview & quick start
│   ├── CONTRIBUTING.md           # Development guidelines
│   ├── TESTING.md               # Comprehensive testing checklist
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── LICENSE                   # MIT License
│   │
├── 📂 Source Code
│   ├── src/                      # React frontend source code
│   │   ├── App.js                # Main React application component
│   │   ├── App.css               # Global application styles
│   │   ├── index.js              # React entry point
│   │   ├── index.css             # Base CSS styles
│   │   └── components/           # React components
│   │       ├── MainContent.js    # Main chat interface
│   │       ├── MainContent.css   # Main content styles
│   │       ├── Sidebar.js        # Sidebar navigation
│   │       ├── Sidebar.css       # Sidebar styles
│   │       ├── Settings.js       # Settings panel
│   │       └── Settings.css      # Settings styles
│   │
├── 📦 Build & Static Assets
│   ├── static/                   # Built React application (for production)
│   ├── public/                   # Public static assets
│   │   └── index.html            # React app HTML template
│   ├── templates/                # Flask HTML templates
│   └── node_modules/             # Node.js dependencies (not in git)
│   │
├── 🚀 Deployment Scripts
│   ├── install.sh                # Automated installation script
│   ├── start.sh                  # Application start script
│   │
├── ⚙️ Configuration
│   ├── .gitignore               # Git ignore rules
│   │
└── 📊 Data & Cache (not in git)
    ├── learning_assistant/       # User data and cache
    └── venv/                     # Python virtual environment
```

## 🔧 Key Files Explained

### **Backend (Python)**

- **`app.py`** - Main Flask web application
  - REST API endpoints for lectures, sessions, documents
  - File upload handling
  - AI model integration
  - WebSocket support for real-time chat

- **`lant.py`** - Core LANT functionality
  - CLI interface for local usage
  - Document processing (PDF, PPT, images)
  - AI model interaction logic
  - Conversation management

- **`requirements.txt`** - Python dependencies
  - Flask, Flask-CORS, requests
  - Document processing libraries
  - AI model integration tools

### **Frontend (React)**

- **`src/App.js`** - Main application component
  - State management (lectures, sessions, settings)
  - Navigation and layout
  - Theme switching
  - Modal/dialog management

- **`src/components/`** - React components
  - **MainContent.js** - Chat interface, message display
  - **Sidebar.js** - Navigation, lecture/session management
  - **Settings.js** - AI model configuration

### **Configuration**

- **`package.json`** - Node.js project configuration
  - Dependencies, scripts, build configuration
  - Proxy setting for backend API

- **`.gitignore`** - Git ignore rules
  - Excludes node_modules, venv, user data
  - Development and build artifacts

### **Documentation**

- **`README.md`** - Project overview, installation, usage
- **`CONTRIBUTING.md`** - Development guidelines, workflow
- **`TESTING.md`** - Comprehensive testing checklist
- **`PROJECT_STRUCTURE.md`** - This structure documentation

## 🚀 Scripts

### **Installation Script (`install.sh`)**
- Checks prerequisites (Python, Node.js, Ollama)
- Creates virtual environment
- Installs Python dependencies
- Installs Node.js dependencies
- Builds React application
- Installs Ollama models
- Creates start script

### **Start Script (`start.sh`)**
- Activates virtual environment
- Starts Ollama service if needed
- Starts Flask application
- Handles port conflicts

## 🌐 Application Flow

1. **User visits `http://localhost:5000`**
2. **Flask serves `index.html` from templates/**
3. **React app loads and makes API calls to Flask**
4. **Flask handles data persistence (lectures, sessions, documents)**
5. **Ollama provides AI capabilities through Flask**

## 📊 Data Storage

- **Lectures**: JSON files in `learning_assistant/lectures/`
- **Sessions**: JSON files within each lecture directory
- **Documents**: Stored within lecture directories
- **Cache**: Temporary files in `learning_assistant/cache/`
- **Settings**: JSON configuration file

## 🔧 Development Workflow

### **Development Mode**
```bash
# Terminal 1: Backend
python app.py

# Terminal 2: Frontend
npm start
```

### **Production Build**
```bash
npm run build
python app.py
```

### **Testing**
```bash
# Run comprehensive testing checklist
# See TESTING.md for detailed instructions
```

## 🎨 Technology Stack

### **Backend**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Ollama** - Local AI model management
- **Python libraries** - Document processing, file handling

### **Frontend**
- **React 18** - UI framework
- **React Router** - Navigation (if needed)
- **FontAwesome** - Icons
- **Styled Components** - CSS-in-JS styling

### **Development Tools**
- **React Scripts** - Build tooling
- **ESLint** - Code linting
- **Babel** - JavaScript transpilation

## 📦 Dependencies

### **Production Dependencies**
- **Python**: Flask, Flask-CORS, requests, python-dotenv
- **Node.js**: React, ReactDOM, React Router, FontAwesome

### **Development Dependencies**
- **Node.js**: React Scripts, ESLint, Babel
- **Python**: (development tools handled by virtual environment)

---

This structure provides a clean, maintainable, and scalable foundation for the LANT-v3 learning assistant application.
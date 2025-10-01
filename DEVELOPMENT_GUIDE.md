# LANT-v3 Development Guide

This comprehensive guide documents the codebase architecture, scalability considerations, and UI customization options for LANT-v3.

## 📋 Table of Contents

1. [🏗️ Codebase Architecture](#codebase-architecture)
2. [🔧 Function Documentation](#function-documentation)
3. [📈 Scalability Guide](#scalability-guide)
4. [🎨 UI Customization](#ui-customization)
5. [🚀 Deployment Options](#deployment-options)
6. [🔍 Debugging & Testing](#debugging--testing)

---

## 🏗️ Codebase Architecture

### **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│   Flask Backend │◄──►│   Ollama AI      │
│     (Client)     │    │    (Server)     │    │   (Local AI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │ File System     │    │   AI Models     │
         │              │ (JSON Storage)  │    │ (Local Models)  │
         │              └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   User Browser  │
│   (Interface)   │
└─────────────────┘
```

### **Component Architecture**

#### **Frontend (React)**
```
App.js (Root Component)
├── State Management
│   ├── Lectures & Sessions
│   ├── UI State (theme, sidebar)
│   ├── Settings (AI models)
│   └── Dialog States
├── Main Layout
│   ├── Top Navigation (theme toggle)
│   ├── Sidebar (navigation)
│   └── Main Content Area
└── Components
    ├── MainContent.js (chat interface)
    ├── Sidebar.js (navigation & management)
    └── Settings.js (configuration)
```

#### **Backend (Flask)**
```
app.py (Flask Application)
├── API Routes
│   ├── /api/lectures/* (lecture management)
│   ├── /api/sessions/* (session management)
│   ├── /api/documents/* (file handling)
│   └── /api/settings/* (configuration)
├── Core Services
│   ├── LectureService (lecture operations)
│   ├── SessionService (session operations)
│   ├── DocumentService (file processing)
│   └── AIService (AI integration)
└── Utilities
    ├── FileHandler (upload/download)
    ├── CacheManager (caching)
    └── ErrorHandler (error handling)
```

### **Data Flow**

```
User Action → React Component → API Call → Flask Backend →
File System/AI → Response → React State Update → UI Re-render
```

---

## 🔧 Function Documentation

### **Frontend Functions**

#### **App.js - Main Application Component**

**State Management:**
```javascript
// Core application state
const [isDarkMode, setIsDarkMode] = useState(false);           // Theme management
const [isSidebarOpen, setIsSidebarOpen] = useState(false);       // Sidebar visibility
const [currentLecture, setCurrentLecture] = useState(null);       // Active lecture
const [currentSession, setCurrentSession] = useState(null);       // Active session
const [lectures, setLectures] = useState([]);                     // All lectures
const [sessions, setSessions] = useState([]);                     // Sessions for current lecture
const [currentModel, setCurrentModel] = useState('codellama:7b'); // AI model
const [modelParams, setModelParams] = useState({                 // Model parameters
  temperature: 0.7,
  top_p: 0.9,
  num_predict: 3072
});
```

**Key Functions:**
```javascript
// Lecture Management
const handleCreateLecture = async () => {
  // Creates new lecture via API
  // Updates lectures state
  // Refreshes session list if needed
};

const handleDeleteLecture = async (lectureName) => {
  // Shows confirmation dialog
  // Deletes lecture and associated sessions
  // Updates UI state accordingly
};

// Session Management
const handleCreateSession = async () => {
  // Creates new session for current lecture
  // Validates lecture selection
  // Updates sessions state
};

// AI Integration
const handleUpdateModel = async (model, params) => {
  // Updates AI model configuration
  // Persists settings to localStorage
  // Applies changes to active sessions
};

// Theme & UI
const toggleTheme = () => {
  // Toggles between light/dark themes
  // Persists preference to localStorage
  // Updates CSS custom properties
};
```

#### **MainContent.js - Chat Interface**

**State Management:**
```javascript
const [messages, setMessages] = useState([]);           // Chat messages
const [inputValue, setInputValue] = useState('');       // Current input
const [isLoading, setIsLoading] = useState(false);      // AI response loading
```

**Key Functions:**
```javascript
// Message Handling
const handleSendMessage = async () => {
  // Sends message to backend
  // Updates messages array
  // Handles AI response streaming
};

const loadMessages = useCallback(async () => {
  // Loads message history for current session
  // Handles pagination for long conversations
  // Updates messages state
}, [currentLecture, currentSession]);

// File Upload
const handleFileUpload = async (files) => {
  // Validates file types and sizes
  // Uploads files to current lecture
  // Updates UI with upload progress
};
```

#### **Sidebar.js - Navigation Component**

**Key Functions:**
```javascript
// Navigation
const handleLectureSelect = (lectureName) => {
  // Sets active lecture
  // Loads associated sessions
  // Updates UI selection state
};

const handleSessionSelect = (sessionName) => {
  // Sets active session
  // Loads conversation history
  // Updates chat interface
};

// Context Menu Actions
const handleContextMenu = (e, item, type) => {
  // Shows right-click context menu
  // Provides delete/rename options
  // Handles action execution
};
```

### **Backend Functions**

#### **app.py - Flask Application**

**Core Routes:**
```python
# Lecture Management
@app.route('/api/lectures', methods=['GET', 'POST'])
def handle_lectures():
    # GET: Retrieve all lectures
    # POST: Create new lecture
    # Returns standardized response format

@app.route('/api/lectures/<lecture_name>', methods=['GET', 'PUT', 'DELETE'])
def handle_lecture(lecture_name):
    # GET: Retrieve specific lecture
    # PUT: Rename lecture
    # DELETE: Remove lecture and associated data

# Session Management
@app.route('/api/lectures/<lecture_name>/sessions', methods=['GET', 'POST'])
def handle_sessions(lecture_name):
    # GET: Retrieve sessions for lecture
    # POST: Create new session
    # Validates lecture existence

@app.route('/api/sessions/<lecture_name>/<session_name>/messages', methods=['GET', 'DELETE'])
def handle_messages(lecture_name, session_name):
    # GET: Retrieve conversation history
    # DELETE: Clear conversation
    # Handles message persistence

# Document Handling
@app.route('/api/lectures/<lecture_name>/documents', methods=['POST'])
def handle_document_upload(lecture_name):
    # Handles file upload (PDF, PPT, images)
    # Validates file types and sizes
    # Processes and stores documents

# AI Integration
@app.route('/api/chat', methods=['POST'])
def handle_chat():
    # Processes user messages
    # Integrates with Ollama AI
    # Streams responses back to client
```

**Service Functions:**
```python
def load_lectures():
    # Loads all lectures from filesystem
    # Returns structured lecture data
    # Handles file system errors

def save_conversation(lecture_name, session_name, messages):
    # Saves conversation to JSON file
    # Implements data persistence
    # Handles concurrent access

def process_uploaded_file(file_path, file_type):
    # Processes different file types
    # Extracts text content
    # Prepares for AI analysis

def get_ai_response(messages, model, params):
    # Formats messages for AI
    # Calls Ollama API
    # Streams responses efficiently
```

#### **lant.py - CLI Functionality**

**Core Functions:**
```python
def create_lecture(lecture_name):
    # Creates lecture directory structure
    # Initializes configuration files
    # Sets up default sessions

def create_session(lecture_name, session_name):
    # Creates session within lecture
    # Initializes conversation file
    # Sets up document storage

def process_document(file_path, lecture_name):
    # Processes various document types
    # Extracts text and metadata
    # Stores in lecture directory

def chat_with_ai(messages, model_params):
    # Handles AI interaction
    # Manages conversation context
    # Returns AI responses
```

---

## 📈 Scalability Guide

### **Current Limitations**

1. **File System Storage**
   - Single-user filesystem storage
   - No backup mechanism
   - Limited to local filesystem capacity

2. **Memory Management**
   - All data loaded into memory
   - No pagination for large datasets
   - Limited caching strategy

3. **AI Model Management**
   - Single Ollama instance
   - No model scaling or load balancing
   - Local-only AI processing

4. **Concurrent Users**
   - Single-user design
   - No user authentication
   - No session isolation between users

### **Scaling Strategies**

#### **Phase 1: Multi-User Support**

**User Authentication:**
```python
# Add user management
class User:
    id: str
    username: str
    email: str
    created_at: datetime
    preferences: dict

# Database schema for users
users_table = {
    'id': 'VARCHAR(36) PRIMARY KEY',
    'username': 'VARCHAR(50) UNIQUE',
    'email': 'VARCHAR(100) UNIQUE',
    'password_hash': 'VARCHAR(255)',
    'created_at': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
}
```

**Data Isolation:**
```python
# User-specific data paths
def get_user_data_path(user_id: str) -> str:
    return f"data/users/{user_id}"

# Lecture isolation
def get_lecture_path(user_id: str, lecture_name: str) -> str:
    return f"data/users/{user_id}/lectures/{lecture_name}"
```

#### **Phase 2: Database Integration**

**Replace JSON Files with Database:**
```python
# Database models
class Lecture(Base):
    __tablename__ = 'lectures'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True)
    lecture_id = Column(Integer, ForeignKey('lectures.id'))
    name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    role = Column(String(10))  # 'user' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Database Configuration:**
```python
# SQLAlchemy integration
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Production database
DATABASE_URL = "postgresql://user:password@localhost/lant_db"

# Development database
DATABASE_URL = "sqlite:///lant.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### **Phase 3: Performance Optimization**

**Caching Strategy:**
```python
# Redis caching
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_lectures_with_cache(user_id: str):
    cache_key = f"lectures:{user_id}"
    cached_data = redis_client.get(cache_key)

    if cached_data:
        return json.loads(cached_data)

    lectures = get_lectures_from_db(user_id)
    redis_client.setex(cache_key, 3600, json.dumps(lectures))
    return lectures
```

**Pagination:**
```python
def get_messages_paginated(session_id: int, page: int, per_page: int = 50):
    offset = (page - 1) * per_page
    messages = db.query(Message)\
        .filter(Message.session_id == session_id)\
        .order_by(Message.created_at)\
        .offset(offset)\
        .limit(per_page)\
        .all()

    return {
        'messages': messages,
        'total': db.query(Message).filter(Message.session_id == session_id).count(),
        'page': page,
        'per_page': per_page
    }
```

#### **Phase 4: Advanced Features**

**File Storage:**
```python
# AWS S3 integration
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def upload_to_s3(file_data, key: str):
    s3_client.put_object(
        Bucket=AWS_S3_BUCKET,
        Key=key,
        Body=file_data,
        ContentType='application/octet-stream'
    )
    return f"https://{AWS_S3_BUCKET}.s3.amazonaws.com/{key}"
```

**Load Balancing:**
```python
# Multiple AI model instances
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

async def get_ai_response_load_balanced(messages, model):
    # Distribute requests across multiple Ollama instances
    instances = ['localhost:11434', 'localhost:11435', 'localhost:11436']
    selected_instance = instances[hash(messages) % len(instances)]

    return await call_ollama_instance(selected_instance, messages, model)
```

### **Deployment Scaling**

#### **Container Orchestration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/lant
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: lant
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### **Cloud Deployment**
```python
# Kubernetes deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lant-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lant-web
  template:
    metadata:
      labels:
        app: lant-web
    spec:
      containers:
      - name: lant-web
        image: lant-web:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: lant-secrets
              key: database-url
```

---

## 🎨 UI Customization

### **Theme System**

#### **CSS Custom Properties**
```css
:root {
  /* Light theme colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-hover: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --border-default: #dee2e6;
  --border-hover: #adb5bd;
  --accent-blue: #0066cc;
  --accent-green: #28a745;
  --accent-orange: #fd7e14;
  --accent-purple: #6f42c1;
  --accent-red: #dc3545;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

[data-theme="dark"] {
  /* Dark theme colors */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-hover: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;
  --border-default: #404040;
  --border-hover: #606060;
}
```

#### **Custom Theme Creation**
```css
/* Create custom theme (e.g., blue theme) */
[data-theme="blue"] {
  --bg-primary: #f0f8ff;
  --bg-secondary: #e6f3ff;
  --bg-hover: #d1e9ff;
  --text-primary: #003366;
  --text-secondary: #0066cc;
  --accent-blue: #004080;
  --accent-green: #0066cc;
  --accent-orange: #0080ff;
  --accent-purple: #4080ff;
}

/* Add theme toggle to theme selector */
const themes = ['light', 'dark', 'blue', 'green', 'purple'];
```

### **Layout Customization**

#### **Sidebar Layout**
```css
/* Sidebar width and positioning */
.sidebar {
  width: 280px;
  min-width: 280px;
  max-width: 400px;
  transition: transform 0.3s ease;
}

/* Collapsed sidebar */
.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
}

/* Responsive sidebar breakpoints */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
```

#### **Main Content Layout**
```css
/* Main content area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Chat interface layout */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Messages area */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Input area */
.input-container {
  padding: 20px;
  border-top: 1px solid var(--border-default);
  background: var(--bg-secondary);
}
```

### **Component Styling**

#### **Button Variations**
```css
/* Primary button */
.btn-primary {
  background: var(--accent-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--accent-blue-hover);
}

/* Secondary button */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

/* Icon button */
.btn-icon {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

#### **Card Components**
```css
/* Base card */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

/* Card header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-default);
}

/* Card body */
.card-body {
  /* Card content styles */
}

/* Card footer */
.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
}
```

### **Responsive Design**

#### **Breakpoint System**
```css
/* Mobile-first responsive design */
/* Mobile: < 768px */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: -280px;
    width: 280px;
    z-index: 1000;
  }

  .sidebar.active {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 240px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### **Layout Variations**
```javascript
// Layout configuration
const layoutOptions = {
  sidebar: {
    position: 'left', // 'left', 'right', 'top', 'bottom'
    width: '280px',
    collapsible: true,
    responsive: true
  },
  header: {
    position: 'top', // 'top', 'bottom', 'hidden'
    height: '60px',
    sticky: true
  },
  main: {
    max_width: '1200px',
    padding: '20px'
  }
};

// Apply layout programmatically
const applyLayout = (config) => {
  document.documentElement.style.setProperty('--sidebar-width', config.sidebar.width);
  // Apply other layout properties
};
```

### **Custom Components**

#### **Advanced Chat Interface**
```jsx
// Enhanced chat component with typing indicators
const EnhancedChat = () => {
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('online');

  return (
    <div className="enhanced-chat-container">
      <div className="chat-header">
        <div className="chat-status">
          <span className={`status-indicator ${onlineStatus}`}></span>
          <span>AI Assistant</span>
          {typingIndicator && <span className="typing-text">AI is typing...</span>}
        </div>
      </div>

      <div className="messages-container enhanced">
        {/* Messages with enhanced styling */}
      </div>

      <div className="input-container enhanced">
        <div className="input-toolbar">
          {/* Formatting tools, file upload, etc. */}
        </div>
        <div className="input-wrapper">
          <textarea
            className="enhanced-textarea"
            placeholder="Type your message..."
          />
          <button className="send-btn">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### **Custom Dashboard Components**
```jsx
// Reusable stat card component
const StatCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {trend && (
          <div className="stat-trend">
            <FontAwesomeIcon icon={trend > 0 ? faArrowUp : faArrowDown} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **Animation & Transitions**

#### **Smooth Animations**
```css
/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Slide in animation */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Smooth transitions for all interactive elements */
button, .nav-btn, .card, .stat-card {
  transition: all 0.2s ease;
}
```

#### **Loading States**
```jsx
// Loading spinner component
const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};
```

---

## 🚀 Deployment Options

### **Development Deployment**
```bash
# Start development servers
npm run dev & python app.py
```

### **Production Deployment**
```bash
# Build and start production
npm run build
python app.py
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.9-alpine AS backend

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --from=frontend-builder /app/build ./static
COPY . .

EXPOSE 5000
CMD ["python", "app.py"]
```

### **Cloud Deployment**
```bash
# Deploy to AWS/Google Cloud/Azure
# Using container registry and load balancer
docker build -t lant-web .
docker push your-registry/lant-web:latest
kubectl apply -f k8s-deployment.yaml
```

---

## 🔍 Debugging & Testing

### **Common Issues & Solutions**

#### **Frontend Issues**
```javascript
// Debug React state changes
const useDebugState = (name, value) => {
  useEffect(() => {
    console.log(`${name} changed:`, value);
  }, [value, name]);
};

// Debug API calls
const debugAPICall = async (url, options) => {
  console.log('API Request:', { url, options });
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

#### **Backend Issues**
```python
# Debug Flask routes
@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.path}")
    print(f"Headers: {dict(request.headers)}")
    if request.json:
        print(f"Body: {request.json}")

# Debug database operations
def debug_db_operation(operation, query, params=None):
    print(f"DB Operation: {operation}")
    print(f"Query: {query}")
    if params:
        print(f"Params: {params}")
```

#### **Performance Debugging**
```javascript
// Performance monitoring
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn('Slow operation:', entry.name, entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, []);
};
```

### **Testing Strategies**

#### **Unit Testing**
```javascript
// React component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import MainContent from './MainContent';

test('renders chat interface', () => {
  render(
    <Provider store={mockStore}>
      <MainContent />
    </Provider>
  );

  expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
});
```

#### **Integration Testing**
```python
# Flask API testing
import pytest
import json

def test_create_lecture(client):
    response = client.post('/api/lectures',
                          json={'name': 'Test Lecture'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert 'Test Lecture' in data['data']['name']
```

---

This comprehensive development guide provides everything needed to understand, customize, and scale the LANT-v3 application effectively.
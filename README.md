# LANT-v3 - Learning Assistant & Note-taking Tool

A powerful, private, and offline-first learning assistant that helps you organize lectures, manage study sessions, and interact with AI models for enhanced learning.

## ✨ Features

- 🎓 **Lecture Management**: Create, organize, and manage your learning materials
- 💬 **Study Sessions**: Track conversations and Q&A sessions for each lecture
- 📄 **Document Upload**: Support for PDF, PPT, DOCX, TXT, Markdown, and images
- 🤖 **AI Integration**: Local AI models for private, offline assistance
- 🛠️ **Learning Tools**: Question generation, conversation summarization, session merging
- 🌓 **Dark/Light Theme**: Comfortable viewing in any environment
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Ollama (for local AI models)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LANT-v3.git
   cd LANT-v3
   ```

2. **Run the installer**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Start the application**
   ```bash
   ./start.sh
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📚 Manual Installation

### Backend Setup

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Ollama models**
   ```bash
   ollama pull qwen2.5-coder:3b-instruct
   ollama pull codellama:7b
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Build the React app**
   ```bash
   npm run build
   ```

## 🛠️ Usage

### Creating Your First Lecture

1. Click the sidebar toggle button (☰) to open the sidebar
2. Click the "+" button in the Workspace section
3. Enter a lecture name and press Enter
4. Your lecture will appear in the list

### Starting a Study Session

1. Select a lecture from the list
2. Click the "+" button in the Sessions section
3. Enter a session name (optional) or leave empty for auto-generation
4. Start chatting with the AI assistant

### Uploading Documents

1. Select a lecture from the list
2. Go to the Documents section in the sidebar
3. Drag and drop files or click to browse
4. Supported formats: PDF, PPT, PPTX, DOCX, TXT, MD, PNG, JPG, JPEG, BMP, TIFF, GIF

### Using Learning Tools

- **Generate Questions**: Creates study questions from your conversation
- **Summarize Conversation**: Provides a concise summary of your session
- **Merge Sessions**: Combines multiple sessions into one
- **Clear Conversation**: Removes all messages from current session

## ⚙️ Configuration

### AI Models

Choose from available models in the sidebar:
- `qwen2.5-coder:3b-instruct` (recommended for most use cases)
- `qwen2.5-coder:7b-instruct` (more powerful, requires more resources)
- `codellama:7b` (good for coding tasks)
- `deepseek-coder:6.7b-instruct` (advanced coding assistance)

### Model Parameters

- **Temperature**: Controls response creativity (0.1-1.0)
- **Top-p**: Controls response diversity (0.1-1.0)
- **Max Tokens**: Limits response length (100-4096)

## 📁 Project Structure

```
LANT-v3/
├── app.py                 # Flask backend application
├── lant.py                # Core LANT functionality
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
├── install.sh            # Installation script
├── start.sh              # Application start script
├── public/               # Static files
├── src/                  # React source code
├── static/               # Built React app
└── templates/            # HTML templates
```

## 🔧 Development

### Running in Development Mode

1. **Start the backend**
   ```bash
   python app.py
   ```

2. **Start the frontend (in another terminal)**
   ```bash
   npm start
   ```

### Building for Production

```bash
npm run build
```

The built files will be placed in the `static/` directory.

## 🐛 Troubleshooting

### Common Issues

**Port 5000 is already in use**
```bash
lsof -ti:5000 | xargs kill -9
```

**Ollama is not running**
```bash
ollama serve
```

**Python module not found**
```bash
pip install -r requirements.txt
```

**Frontend build fails**
```bash
npm install
npm run build
```

### Performance Tips

- Use smaller models (3B) for better performance on older hardware
- Clear cache periodically if the app becomes slow
- Close unused sessions to free up memory

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- Ollama for local AI model support
- React for the modern frontend framework
- Flask for the lightweight backend
- FontAwesome for beautiful icons

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**LANT-v3** - Your private, offline learning companion.
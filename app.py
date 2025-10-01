#!/usr/bin/env python3
"""
LANT Web Application
Modern web interface for the Learning Assistant
"""

from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import json
import threading
import tempfile
import psutil
import platform
from datetime import datetime
from werkzeug.utils import secure_filename

# Import our existing backend
from lant import SilentDirectoryAssistant, CommandHandler

# Initialize Flask app
app = Flask(__name__, static_folder='build', static_url_path='/')

# Enable CORS for all routes
CORS(app)

# Configure Flask
app.config['SECRET_KEY'] = 'lant-secret-key'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Global application state
assistant = SilentDirectoryAssistant()
command_handler = CommandHandler(assistant)

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'ppt', 'pptx', 'docx', 'txt', 'md',
    'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif'
}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main dashboard page - serve React app"""
    try:
        return send_file('build/index.html')
    except:
        # Fallback to template if build doesn't exist
        return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    """Serve React static files"""
    try:
        return send_from_directory('build/static', path)
    except:
        return "File not found", 404

@app.route('/api/status')
def get_status():
    """Get application status"""
    try:
        status = assistant.get_status()
        return jsonify({
            'success': True,
            'data': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures', methods=['GET'])
def get_lectures():
    """Get all lectures"""
    try:
        lectures = assistant.list_lectures()
        return jsonify({
            'success': True,
            'data': lectures
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures', methods=['POST'])
def create_lecture():
    """Create a new lecture"""
    try:
        data = request.get_json()
        lecture_name = data.get('name', '').strip()

        if not lecture_name:
            return jsonify({
                'success': False,
                'error': 'Lecture name cannot be empty'
            }), 400

        result = assistant.create_lecture(lecture_name)

        return jsonify({
            'success': True,
            'message': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>', methods=['GET'])
def get_lecture_info(lecture_name):
    """Get lecture information"""
    try:
        if assistant.load_lecture(lecture_name):
            sessions = assistant.list_sessions()
            lecture_info = {
                'name': lecture_name,
                'sessions': sessions,
                'current_session': assistant.current_session
            }
            return jsonify({
                'success': True,
                'data': lecture_info
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>', methods=['DELETE'])
def delete_lecture(lecture_name):
    """Delete a lecture"""
    try:
        import shutil
        import os

        lecture_path = os.path.join(assistant.base_dir, 'lectures', lecture_name)
        if not os.path.exists(lecture_path):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        # Remove the lecture directory and all its contents
        shutil.rmtree(lecture_path)

        # Clear current selection if this was the active lecture
        if assistant.current_lecture == lecture_name:
            assistant.current_lecture = None
            assistant.current_session = None

        return jsonify({
            'success': True,
            'message': f'Lecture {lecture_name} deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions/<session_name>', methods=['DELETE'])
def delete_session(lecture_name, session_name):
    """Delete a session"""
    try:
        import os

        # Load the lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        session_path = os.path.join(assistant.base_dir, 'lectures', lecture_name, 'sessions', f'{session_name}.json')
        if not os.path.exists(session_path):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        # Remove the session file
        os.remove(session_path)

        # Clear current selection if this was the active session
        if assistant.current_session == session_name:
            assistant.current_session = None

        return jsonify({
            'success': True,
            'message': f'Session {session_name} deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>', methods=['PUT'])
def rename_lecture(lecture_name):
    """Rename a lecture"""
    try:
        import os
        import shutil

        data = request.get_json()
        new_name = data.get('new_name', '').strip()

        if not new_name:
            return jsonify({
                'success': False,
                'error': 'New lecture name cannot be empty'
            }), 400

        if new_name == lecture_name:
            return jsonify({
                'success': False,
                'error': 'New name must be different from current name'
            }), 400

        old_path = os.path.join(assistant.base_dir, 'lectures', lecture_name)
        new_path = os.path.join(assistant.base_dir, 'lectures', new_name)

        if not os.path.exists(old_path):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        if os.path.exists(new_path):
            return jsonify({
                'success': False,
                'error': 'Lecture with this name already exists'
            }), 400

        # Rename the lecture directory
        shutil.move(old_path, new_path)

        # Update current selection if this was the active lecture
        if assistant.current_lecture == lecture_name:
            assistant.current_lecture = new_name

        return jsonify({
            'success': True,
            'message': f'Lecture renamed from {lecture_name} to {new_name}'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions/<session_name>', methods=['PUT'])
def rename_session(lecture_name, session_name):
    """Rename a session"""
    try:
        import os

        data = request.get_json()
        new_name = data.get('new_name', '').strip()

        if not new_name:
            return jsonify({
                'success': False,
                'error': 'New session name cannot be empty'
            }), 400

        if new_name == session_name:
            return jsonify({
                'success': False,
                'error': 'New name must be different from current name'
            }), 400

        # Load the lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        old_path = os.path.join(assistant.base_dir, 'lectures', lecture_name, 'sessions', f'{session_name}.json')
        new_path = os.path.join(assistant.base_dir, 'lectures', lecture_name, 'sessions', f'{new_name}.json')

        if not os.path.exists(old_path):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        if os.path.exists(new_path):
            return jsonify({
                'success': False,
                'error': 'Session with this name already exists'
            }), 400

        # Rename the session file
        os.rename(old_path, new_path)

        # Update current selection if this was the active session
        if assistant.current_session == session_name:
            assistant.current_session = new_name

        return jsonify({
            'success': True,
            'message': f'Session renamed from {session_name} to {new_name}'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions', methods=['GET'])
def get_sessions(lecture_name):
    """Get sessions for a lecture"""
    try:
        if assistant.load_lecture(lecture_name):
            sessions = assistant.list_sessions()
            return jsonify({
                'success': True,
                'data': sessions
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions', methods=['POST'])
def create_session(lecture_name):
    """Create a new session in a lecture"""
    try:
        data = request.get_json()
        session_name = data.get('name', '').strip()

        # Load the lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        result = assistant.create_session(session_name if session_name else None)

        return jsonify({
            'success': True,
            'message': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sessions/<lecture_name>/<session_name>', methods=['GET'])
def load_session(lecture_name, session_name):
    """Load a specific session"""
    try:
        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        # Load session
        if not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        # Get session history
        messages = assistant.get_session_history()
        session_data = {
            'name': session_name,
            'lecture': lecture_name,
            'messages': messages,
            'model': assistant.model,
            'model_params': assistant.model_params
        }

        return jsonify({
            'success': True,
            'data': session_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sessions/<lecture_name>/<session_name>/messages', methods=['POST'])
def send_message(lecture_name, session_name):
    """Send a message to the AI assistant"""
    try:
        # Load the session
        if not assistant.load_lecture(lecture_name) or not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        data = request.get_json()
        message = data.get('message', '').strip()

        if not message:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400

        # Get AI response
        response = assistant.chat(message)

        return jsonify({
            'success': True,
            'data': {
                'response': response,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sessions/<lecture_name>/<session_name>/messages', methods=['GET'])
def get_messages(lecture_name, session_name):
    """Get all messages for a session"""
    try:
        # Load the session
        if not assistant.load_lecture(lecture_name) or not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        # Get conversation history
        messages = assistant.get_conversation_history()

        return jsonify({
            'success': True,
            'data': {
                'messages': messages
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sessions/<lecture_name>/<session_name>/messages', methods=['DELETE'])
def clear_messages(lecture_name, session_name):
    """Clear all messages for a session"""
    try:
        # Load the session
        if not assistant.load_lecture(lecture_name) or not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        # Clear conversation history
        assistant.clear_conversation_history()

        return jsonify({
            'success': True,
            'data': {
                'message': 'Conversation cleared successfully'
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/documents', methods=['POST'])
def upload_document(lecture_name):
    """Upload a document to a lecture"""
    try:
        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'File type not allowed'
            }), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(tempfile.gettempdir(), filename)
        file.save(temp_path)

        try:
            # Add document to lecture or session
            if assistant.current_session:
                result = assistant.add_document_to_session(temp_path)
            else:
                result = assistant.add_document_to_lecture(temp_path)

            return jsonify({
                'success': True,
                'message': result
            })
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions/merge', methods=['POST'])
def merge_sessions(lecture_name):
    """Merge selected sessions in a lecture"""
    try:
        data = request.get_json()
        sessions_to_merge = data.get('sessions', [])
        new_session_name = data.get('new_session_name', f'Merged Session - {datetime.now().strftime("%Y-%m-%d %H:%M")}')

        if len(sessions_to_merge) < 2:
            return jsonify({
                'success': False,
                'error': 'At least 2 sessions are required for merging'
            }), 400

        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        # Create new merged session
        assistant.create_session(new_session_name)

        # Merge content from selected sessions
        merged_content = []
        for session_name in sessions_to_merge:
            if assistant.load_session(session_name):
                # Get session messages
                session_file = os.path.join(assistant.sessions_dir, f"{session_name}.json")
                if os.path.exists(session_file):
                    with open(session_file, 'r', encoding='utf-8') as f:
                        session_data = json.load(f)
                        messages = session_data.get('messages', [])
                        merged_content.extend(messages)

        # Save merged content to new session
        assistant.current_session['messages'] = merged_content
        assistant.save_session()

        return jsonify({
            'success': True,
            'message': f'Successfully merged {len(sessions_to_merge)} sessions into "{new_session_name}"',
            'data': {
                'new_session': new_session_name,
                'merged_sessions': sessions_to_merge
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/questions', methods=['POST'])
def generate_questions(lecture_name):
    """Generate study questions for a lecture"""
    try:
        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        data = request.get_json()
        scope = data.get('scope', 'all')  # 'all' or 'current'

        if scope == 'current' and not assistant.current_session:
            return jsonify({
                'success': False,
                'error': 'No session selected for current scope'
            }), 400

        result = assistant.generate_questions(scope)

        return jsonify({
            'success': True,
            'data': {
                'questions': result,
                'scope': scope
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/model', methods=['GET'])
def get_model_info():
    """Get current model information"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'model': assistant.model,
                'params': assistant.model_params,
                'available_models': [
                    "qwen2.5-coder:3b-instruct",
                    "qwen2.5-coder:7b-instruct",
                    "codellama:7b",
                    "deepseek-coder:6.7b-instruct"
                ]
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/model', methods=['PUT'])
def update_model():
    """Update model settings"""
    try:
        data = request.get_json()
        model = data.get('model')
        params = data.get('params', {})

        # Update model if specified
        if model and model != assistant.model:
            assistant.model = model

        # Update parameters if specified
        for param, value in params.items():
            assistant.set_model_parameter(param, value)

        return jsonify({
            'success': True,
            'message': 'Model settings updated',
            'data': {
                'model': assistant.model,
                'params': assistant.model_params
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions/<session_name>/questions', methods=['POST'])
def generate_session_questions(lecture_name, session_name):
    """Generate study questions for a specific session"""
    try:
        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        # Load session
        if not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        result = assistant.generate_questions('current')

        return jsonify({
            'success': True,
            'data': {
                'questions': result,
                'session': session_name
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lectures/<lecture_name>/sessions/<session_name>/summary', methods=['POST'])
def summarize_conversation(lecture_name, session_name):
    """Generate conversation summary for a specific session"""
    try:
        # Load lecture first
        if not assistant.load_lecture(lecture_name):
            return jsonify({
                'success': False,
                'error': 'Lecture not found'
            }), 404

        # Load session
        if not assistant.load_session(session_name):
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404

        result = assistant.summarize_conversation()

        return jsonify({
            'success': True,
            'data': {
                'summary': result,
                'session': session_name
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update application settings"""
    try:
        data = request.get_json()
        model = data.get('model')
        params = data.get('params', {})

        # Update model if specified
        if model and model != assistant.model:
            assistant.model = model

        # Update parameters if specified
        for param, value in params.items():
            assistant.set_model_parameter(param, value)

        return jsonify({
            'success': True,
            'message': 'Settings updated successfully',
            'data': {
                'model': assistant.model,
                'params': assistant.model_params
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/system/info', methods=['GET'])
def get_system_info():
    """Get system monitoring information"""
    try:
        # Memory usage
        memory = psutil.virtual_memory()
        memory_info = {
            'total': memory.total,
            'available': memory.available,
            'used': memory.used,
            'percent': memory.percent
        }

        # CPU usage
        cpu_info = {
            'percent': psutil.cpu_percent(interval=1),
            'count': psutil.cpu_count(),
            'count_logical': psutil.cpu_count(logical=True)
        }

        # Disk usage
        disk = psutil.disk_usage('/')
        disk_info = {
            'total': disk.total,
            'used': disk.used,
            'free': disk.free,
            'percent': disk.percent
        }

        # Process info
        process = psutil.Process()
        process_info = {
            'memory_percent': process.memory_percent(),
            'cpu_percent': process.cpu_percent(),
            'threads': process.num_threads(),
            'open_files': len(process.open_files())
        }

        # System info
        system_info = {
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'processor': platform.processor()
        }

        return jsonify({
            'success': True,
            'data': {
                'memory': memory_info,
                'cpu': cpu_info,
                'disk': disk_info,
                'process': process_info,
                'system': system_info,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/documents/info', methods=['GET'])
def get_documents_info():
    """Get document processing information"""
    try:
        # Count documents by type
        document_stats = {}
        total_size = 0

        if hasattr(assistant, 'documents_dir') and os.path.exists(assistant.documents_dir):
            for root, dirs, files in os.walk(assistant.documents_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    if os.path.exists(file_path):
                        ext = file.rsplit('.', 1)[1].lower() if '.' in file else 'unknown'
                        size = os.path.getsize(file_path)
                        document_stats[ext] = document_stats.get(ext, 0) + 1
                        total_size += size

        # Cache info
        cache_info = {}
        if hasattr(assistant, 'cache_dir') and os.path.exists(assistant.cache_dir):
            cache_files = [f for f in os.listdir(assistant.cache_dir) if f.endswith('.cache')]
            cache_info = {
                'file_count': len(cache_files),
                'total_size': sum(os.path.getsize(os.path.join(assistant.cache_dir, f)) for f in cache_files if os.path.exists(os.path.join(assistant.cache_dir, f)))
            }

        return jsonify({
            'success': True,
            'data': {
                'document_stats': document_stats,
                'total_documents': sum(document_stats.values()),
                'total_size': total_size,
                'cache_info': cache_info,
                'supported_formats': list(ALLOWED_EXTENSIONS)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cache', methods=['DELETE'])
def clear_cache():
    """Clear document cache"""
    try:
        result = assistant.clear_cache()
        return jsonify({
            'success': True,
            'message': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/commands', methods=['POST'])
def execute_command():
    """Execute a command from the lant.py system"""
    try:
        data = request.get_json()
        command = data.get('command', '')
        current_lecture = data.get('currentLecture')
        current_session = data.get('currentSession')

        # Set the current lecture and session context
        if current_lecture and current_lecture != assistant.current_lecture:
            assistant.load_lecture(current_lecture)
        if current_session and current_session != assistant.current_session:
            assistant.load_session(current_session)

        # Execute the command using the existing command handler
        result = command_handler.execute(command)

        # If the result is 'EXIT', handle appropriately
        if result == 'EXIT':
            return jsonify({
                'success': True,
                'data': 'Command executed successfully'
            })

        # If result is None (for commands that print directly), get status
        if result is None:
            status = assistant.get_status()
            result = f"Command executed. Current status: {status.get('current_lecture', 'None')} - {status.get('current_session', 'None')}"

        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting LANT Web Application...")
    print("📱 Open your browser and go to: http://localhost:5001")
    print("🔧 Press Ctrl+C to stop the server")

    app.run(debug=True, host='0.0.0.0', port=5001)
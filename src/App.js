import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  faBars,
  faTimes,
  faFolder,
  faComments,
  faUpload,
  faPlus,
  faCog,
  faQuestionCircle,
  faChevronDown,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Settings from './components/Settings';
import './App.css';

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="dialog-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="dialog-btn confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Model state
  const [currentModel, setCurrentModel] = useState('codellama:7b');
  const [modelParams, setModelParams] = useState({
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 3072
  });
  const [availableModels, setAvailableModels] = useState([
    'qwen2.5-coder:3b-instruct',
    'qwen2.5-coder:7b-instruct',
    'codellama:7b',
    'deepseek-coder:6.7b-instruct'
  ]);

  // Confirmation dialog state
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemType: '',
    itemName: ''
  });

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));

    // Load sidebar preference
    const savedSidebar = localStorage.getItem('sidebarOpen');
    setIsSidebarOpen(savedSidebar !== 'false');

    // Load AI model settings
    const savedModel = localStorage.getItem('aiModel');
    const savedParams = localStorage.getItem('aiParams');
    if (savedModel) {
      setCurrentModel(savedModel);
    } else {
      // Set default model from lant.py
      setCurrentModel('codellama:7b');
    }
    if (savedParams) {
      setModelParams(JSON.parse(savedParams));
    } else {
      // Set default model parameters from lant.py
      setModelParams({
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 3072
      });
    }

    // Load initial data
    loadLectures();
  }, []);

  useEffect(() => {
    // Apply theme
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      onConfirm,
      itemType: '',
      itemName: ''
    });
  };

  const closeConfirmDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const loadLectures = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lectures');
      const result = await response.json();
      if (result.success) {
        setLectures(result.data);
      }
    } catch (error) {
      console.error('Failed to load lectures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async (lectureName) => {
    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(lectureName)}/sessions`);
      const result = await response.json();
      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const selectLecture = (lectureName) => {
    setCurrentLecture(lectureName);
    setCurrentSession(null);
    loadSessions(lectureName);
  };

  const selectSession = (sessionName) => {
    setCurrentSession(sessionName);
  };

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/cache', {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        alert('Cache cleared successfully');
      } else {
        alert('Failed to clear cache: ' + result.error);
      }
    } catch (error) {
      alert('Failed to clear cache: ' + error.message);
    }
  };

  const handleCreateLecture = async () => {
    const name = prompt('Enter lecture name:');
    if (!name) return;

    try {
      const response = await fetch('/api/lectures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      const result = await response.json();
      if (result.success) {
        loadLectures();
      } else {
        alert('Failed to create lecture: ' + result.error);
      }
    } catch (error) {
      alert('Failed to create lecture: ' + error.message);
    }
  };

  const handleCreateSession = async () => {
    if (!currentLecture) {
      alert('Please select a lecture first');
      return;
    }

    const name = prompt('Enter session name (leave empty for auto-generated):');
    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name || undefined })
      });
      const result = await response.json();
      if (result.success) {
        loadSessions(currentLecture);
      } else {
        alert('Failed to create session: ' + result.error);
      }
    } catch (error) {
      alert('Failed to create session: ' + error.message);
    }
  };

  const handleDeleteLecture = async (lectureName) => {
    showConfirmDialog(
      'Delete Lecture',
      `Are you sure you want to delete the lecture "${lectureName}"? This will delete all sessions and documents in this lecture.`,
      async () => {
        try {
          const response = await fetch(`/api/lectures/${encodeURIComponent(lectureName)}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          if (result.success) {
            // Clear current selection if this was the active lecture
            if (currentLecture === lectureName) {
              setCurrentLecture(null);
              setCurrentSession(null);
              setSessions([]);
            }
            loadLectures();
            closeConfirmDialog();
          } else {
            alert('Failed to delete lecture: ' + result.error);
          }
        } catch (error) {
          alert('Failed to delete lecture: ' + error.message);
        }
      }
    );
  };

  const handleDeleteSession = async (sessionName) => {
    if (!currentLecture) {
      alert('No lecture selected');
      return;
    }

    showConfirmDialog(
      'Delete Session',
      `Are you sure you want to delete the session "${sessionName}"?`,
      async () => {
        try {
          const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions/${encodeURIComponent(sessionName)}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          if (result.success) {
            // Clear current selection if this was the active session
            if (currentSession === sessionName) {
              setCurrentSession(null);
            }
            loadSessions(currentLecture);
            closeConfirmDialog();
          } else {
            alert('Failed to delete session: ' + result.error);
          }
        } catch (error) {
          alert('Failed to delete session: ' + error.message);
        }
      }
    );
  };

  const handleRenameLecture = async (oldName) => {
    const newName = prompt('Enter new lecture name:', oldName);
    if (!newName || newName === oldName) return;

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_name: newName })
      });
      const result = await response.json();
      if (result.success) {
        // Update current selection if this was the active lecture
        if (currentLecture === oldName) {
          setCurrentLecture(newName);
        }
        loadLectures();
        alert('Lecture renamed successfully');
      } else {
        alert('Failed to rename lecture: ' + result.error);
      }
    } catch (error) {
      alert('Failed to rename lecture: ' + error.message);
    }
  };

  const handleRenameSession = async (oldName) => {
    if (!currentLecture) {
      alert('No lecture selected');
      return;
    }

    const newName = prompt('Enter new session name:', oldName);
    if (!newName || newName === oldName) return;

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_name: newName })
      });
      const result = await response.json();
      if (result.success) {
        // Update current selection if this was the active session
        if (currentSession === oldName) {
          setCurrentSession(newName);
        }
        loadSessions(currentLecture);
        alert('Session renamed successfully');
      } else {
        alert('Failed to rename session: ' + result.error);
      }
    } catch (error) {
      alert('Failed to rename session: ' + error.message);
    }
  };

  const handleUpdateModel = async (model, params) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          params
        })
      });
      const result = await response.json();
      if (result.success) {
        setCurrentModel(model);
        setModelParams(params);
        // Save to localStorage for persistence
        localStorage.setItem('aiModel', model);
        localStorage.setItem('aiParams', JSON.stringify(params));
      } else {
        alert('Failed to update model settings: ' + result.error);
      }
    } catch (error) {
      alert('Failed to update model settings: ' + error.message);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!currentLecture || !currentSession) {
      alert('Please select a lecture and session first');
      return;
    }

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions/${encodeURIComponent(currentSession)}/questions`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setGeneratedQuestions(result.data.questions);
        setShowQuestionDialog(true);
      } else {
        alert('Failed to generate questions: ' + result.error);
      }
    } catch (error) {
      alert('Failed to generate questions: ' + error.message);
    }
  };

  const handleSummarizeConversation = async () => {
    if (!currentLecture || !currentSession) {
      alert('Please select a lecture and session first');
      return;
    }

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions/${encodeURIComponent(currentSession)}/summary`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setConversationSummary(result.data.summary);
        setShowSummaryDialog(true);
      } else {
        alert('Failed to generate summary: ' + result.error);
      }
    } catch (error) {
      alert('Failed to generate summary: ' + error.message);
    }
  };

  const handleClearConversation = async () => {
    if (!currentLecture || !currentSession) {
      alert('Please select a lecture and session first');
      return;
    }

    if (window.confirm('Are you sure you want to clear all messages in this session?')) {
      try {
        const response = await fetch(`/api/sessions/${encodeURIComponent(currentLecture)}/${encodeURIComponent(currentSession)}/messages`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          alert('Conversation cleared successfully');
          // Refresh the current view to show cleared messages
          // This will trigger a reload of messages in the MainContent component
          const tempSession = currentSession;
          setCurrentSession(null);
          setTimeout(() => setCurrentSession(tempSession), 100);
        } else {
          alert('Failed to clear conversation: ' + result.error);
        }
      } catch (error) {
        alert('Failed to clear conversation: ' + error.message);
      }
    }
  };

  const handleMergeSessions = async () => {
    if (selectedSessions.length < 2) {
      alert('Please select at least 2 sessions to merge');
      return;
    }

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessions: selectedSessions,
          new_session_name: `Merged Session - ${new Date().toLocaleDateString()}`
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Sessions merged successfully!');
        setShowMergeDialog(false);
        setSelectedSessions([]);
        loadSessions(currentLecture);
      } else {
        alert('Failed to merge sessions: ' + result.error);
      }
    } catch (error) {
      alert('Failed to merge sessions: ' + error.message);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="app-title">
            <FontAwesomeIcon icon={faFolder} className="app-icon" />
            <span>LANT</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-actions">
            <button
              className="nav-btn theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          lectures={lectures}
          sessions={sessions}
          currentLecture={currentLecture}
          currentSession={currentSession}
          onSelectLecture={selectLecture}
          onSelectSession={selectSession}
          onCreateLecture={handleCreateLecture}
          onCreateSession={handleCreateSession}
          onDeleteLecture={handleDeleteLecture}
          onDeleteSession={handleDeleteSession}
          onRenameLecture={handleRenameLecture}
          onRenameSession={handleRenameSession}
          onUpload={handleUpload}
          onClearCache={handleClearCache}
          onOpenSettings={handleOpenSettings}
          onMergeSessions={() => setShowMergeDialog(true)}
          onGenerateQuestions={handleGenerateQuestions}
          onSummarizeConversation={handleSummarizeConversation}
          onClearConversation={handleClearConversation}
          currentModel={currentModel}
          modelParams={modelParams}
          availableModels={availableModels}
          onUpdateModel={handleUpdateModel}
          isLoading={isLoading}
        />

        {/* Main Content */}
        <MainContent
          isSidebarOpen={isSidebarOpen}
          currentLecture={currentLecture}
          currentSession={currentSession}
          onToggleSidebar={toggleSidebar}
          currentModel={currentModel}
          modelParams={modelParams}
          availableModels={availableModels}
          onUpdateModel={handleUpdateModel}
        />

        {/* Settings Panel */}
        <Settings
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          currentModel={currentModel}
          modelParams={modelParams}
          availableModels={availableModels}
          onUpdateModel={handleUpdateModel}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onCancel={closeConfirmDialog}
      />

      {/* Merge Sessions Dialog */}
      {showMergeDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Merge Sessions</h3>
            <p>Select sessions to merge into a new combined session:</p>
            <div className="session-list">
              {sessions.map(session => (
                <div key={session} className="session-item">
                  <input
                    type="checkbox"
                    id={session}
                    checked={selectedSessions.includes(session)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSessions(prev => [...prev, session]);
                      } else {
                        setSelectedSessions(prev => prev.filter(s => s !== session));
                      }
                    }}
                  />
                  <label htmlFor={session}>{session}</label>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setShowMergeDialog(false)}>
                Cancel
              </button>
              <button className="dialog-btn confirm" onClick={handleMergeSessions}>
                Merge Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Dialog */}
      {showQuestionDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content large">
            <h3>Generated Questions</h3>
            <div className="questions-list">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="question-item">
                  <p><strong>Q{index + 1}:</strong> {question}</p>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setShowQuestionDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Dialog */}
      {showSummaryDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content large">
            <h3>Conversation Summary</h3>
            <div className="summary-content">
              <p>{conversationSummary}</p>
            </div>
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setShowSummaryDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function handleUpload(files) {
    if (!currentLecture) {
      alert('Please select a lecture first');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/documents`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        alert('Documents uploaded successfully');
      } else {
        alert('Failed to upload documents: ' + result.error);
      }
    } catch (error) {
      alert('Failed to upload documents: ' + error.message);
    }
  }
}

export default App;
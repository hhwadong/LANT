import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBrain, faPaperPlane, faChevronDown, faTerminal, faTimes } from '@fortawesome/free-solid-svg-icons';
import './MainContent.css';

const MainContent = ({
  isSidebarOpen,
  currentLecture,
  currentSession,
  onToggleSidebar,
  currentModel,
  modelParams,
  availableModels,
  onUpdateModel
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const messagesEndRef = useRef(null);

  // Available commands from lant.py
  const commands = [
    { command: '/add-lecture', description: 'Add a new lecture by name', args: '<name>' },
    { command: '/add-document', description: 'Add a document to the current lecture/session', args: '<file>' },
    { command: '/list-lectures', description: 'List all lectures', args: '' },
    { command: '/use-lecture', description: 'Select a lecture', args: '<name>' },
    { command: '/new-session', description: 'Create new session in current lecture', args: '[name]' },
    { command: '/list-sessions', description: 'List sessions in current lecture', args: '' },
    { command: '/use-session', description: 'Select a session', args: '<name>' },
    { command: '/merge-sessions', description: 'Merge all sessions in current lecture', args: '' },
    { command: '/generate-questions', description: 'Generate study questions', args: '' },
    { command: '/analyze', description: 'Analyze lecture with a question', args: '<question>' },
    { command: '/status', description: 'Show current system status', args: '' },
    { command: '/clear-cache', description: 'Clear document cache', args: '' },
    { command: '/set-param', description: 'Set model parameter', args: '<parameter> <value>' },
    { command: '/list-params', description: 'List current model parameters', args: '' },
    { command: '/list-summaries', description: 'List conversation summaries', args: '' },
    { command: '/summarize', description: 'Summarize current conversation', args: '' },
    { command: '/model', description: 'Change AI model', args: '<model_name>' },
    { command: '/help', description: 'Show help information', args: '' }
  ];

  console.log('Commands loaded:', commands.length);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentLecture || !currentSession) return;

    // Check if it's a command
    if (inputValue.startsWith('/')) {
      await handleCommand(inputValue);
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(currentLecture)}/${encodeURIComponent(currentSession)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: inputValue })
      });
      const result = await response.json();

      if (result.success) {
        const assistantMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: result.data.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error: ' + result.error,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I failed to connect to the server: ' + error.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = async (commandText) => {
    // Display command in chat but mark as system message
    const commandMessage = {
      role: 'system',
      content: `> ${commandText}`,
      timestamp: new Date().toISOString(),
      isCommand: true
    };
    setMessages(prev => [...prev, commandMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: commandText,
          currentLecture,
          currentSession
        })
      });
      const result = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: result.success ? result.data : 'Error: ' + result.error,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Command execution failed: ' + error.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    if (value === '/') {
      // Show all commands when just typing /
      setFilteredCommands(commands);
      setSelectedCommandIndex(0);
      setShowCommandMenu(true);
    } else if (value.startsWith('/')) {
      const query = value.toLowerCase();
      const filtered = commands.filter(cmd =>
        cmd.command.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
      );
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
      setShowCommandMenu(true);
    } else {
      setShowCommandMenu(false);
    }
  };

  // Close command menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCommandMenu && !e.target.closest('.chat-input-wrapper')) {
        setShowCommandMenu(false);
      }
      if (showCommandPalette && !e.target.closest('.chat-input-wrapper')) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCommandMenu, showCommandPalette]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Space or Cmd+Space to open command palette
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }
      // Escape to close command palette
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  useEffect(() => {
    console.log('showCommandPalette changed:', showCommandPalette);
  }, [showCommandPalette]);

  
  const selectCommand = (command) => {
    setInputValue(command.command + ' ');
    setShowCommandMenu(false);
    document.querySelector('.exact-input')?.focus();
  };

  const executeCommandFromPalette = async (command) => {
    console.log('Executing command:', command);
    const commandText = command.command;
    setShowCommandPalette(false);

    // Display command in chat but mark as system message
    const commandMessage = {
      role: 'system',
      content: `> ${commandText}`,
      timestamp: new Date().toISOString(),
      isCommand: true
    };
    setMessages(prev => [...prev, commandMessage]);

    // Execute the command
    try {
      const response = await fetch(`/api/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: commandText,
          currentLecture,
          currentSession
        })
      });
      const result = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: result.success ? result.data : 'Error: ' + result.error,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Command execution failed: ' + error.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e) => {
    // Handle command menu navigation
    if (showCommandMenu) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCommandIndex(prev =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
          return;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedCommandIndex]) {
            // Auto-complete command
            setInputValue(filteredCommands[selectedCommandIndex].command + ' ');
            setShowCommandMenu(false);
          }
          return;
        case 'Escape':
          setShowCommandMenu(false);
          return;
      }
    }

    // Handle Enter key for sending messages and commands
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Allow Shift+Enter to create new lines (default textarea behavior)
  };

  useEffect(() => {
    if (currentLecture) {
      loadSessions();
    } else {
      setSessions([]);
    }
  }, [currentLecture]);

  useEffect(() => {
    if (currentLecture && currentSession) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentLecture, currentSession]);

  const loadSessions = async () => {
    try {
      const response = await fetch(`/api/lectures/${encodeURIComponent(currentLecture)}/sessions`);
      const result = await response.json();
      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(currentLecture)}/${encodeURIComponent(currentSession)}/messages`);
      const result = await response.json();
      if (result.success) {
        setMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  return (
    <main className={`main-content ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Header */}
      <div className="content-header">
        <div className="header-left">
          {!isSidebarOpen && (
            <button
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title="Open sidebar"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          <h1 className="page-title">
            {currentLecture && currentSession
              ? `${currentLecture} - ${currentSession}`
              : currentLecture
              ? currentLecture
              : 'Welcome to LANT'}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="content-body">
        {currentLecture && currentSession ? (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="message assistant">
                  <div className="message-content">
                    <p>Hello! I'm your learning assistant. How can I help you with your studies today?</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}${message.isCommand ? ' command-message' : ''}`}>
                    <div className="message-content">
                      <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content">
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                {/* Command Palette Button */}
                <div className="command-palette-container">
                  <button
                    className="command-palette-btn"
                    onClick={() => {
                      console.log('Command palette button clicked, current state:', showCommandPalette);
                      setShowCommandPalette(!showCommandPalette);
                    }}
                    title="Command Palette (Ctrl+Space)"
                  >
                    <FontAwesomeIcon icon={faTerminal} />
                    <span>Commands</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`chevron ${showCommandPalette ? 'expanded' : ''}`}
                    />
                  </button>
                </div>

                <div className="exact-textbox">
                  <textarea
                    className="exact-input"
                    placeholder="Ask me anything about your studies... (Type / for commands)"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                    style={{ resize: 'none' }}
                  />
                  <button
                    className="exact-send-button"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>

                {/* Command Auto-complete Menu */}
                {showCommandMenu && (
                  <div className="command-menu">
                    <div className="command-menu-header">
                      <span>Commands</span>
                      <span className="command-hint">Press ↑↓ to navigate, ↵ to select, Esc to close</span>
                    </div>
                    <div className="command-list">
                      {filteredCommands.map((cmd, index) => (
                        <div
                          key={cmd.command}
                          className={`command-item ${index === selectedCommandIndex ? 'selected' : ''}`}
                          onClick={() => selectCommand(cmd)}
                          onMouseEnter={() => setSelectedCommandIndex(index)}
                        >
                          <div className="command-name">
                            <span className="command-text">{cmd.command}</span>
                            {cmd.args && <span className="command-args">{cmd.args}</span>}
                          </div>
                          <div className="command-description">{cmd.description}</div>
                        </div>
                      ))}
                      {filteredCommands.length === 0 && (
                        <div className="command-item no-results">
                          No commands found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Command Palette */}
                {showCommandPalette && (
                  <div className="command-palette">
                    <div className="command-palette-header">
                      <span>Command Palette</span>
                      <button
                        className="close-palette-btn"
                        onClick={() => setShowCommandPalette(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="command-palette-list">
                      {commands.map((cmd) => (
                        <div
                          key={cmd.command}
                          className="command-palette-item"
                          onClick={() => executeCommandFromPalette(cmd)}
                        >
                          <div className="command-palette-name">
                            <span className="command-text">{cmd.command}</span>
                            {cmd.args && <span className="command-args">{cmd.args}</span>}
                          </div>
                          <div className="command-palette-description">{cmd.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-container">
            <div className="welcome-content">
              <div className="welcome-icon">
                <FontAwesomeIcon icon={faBars} size="3x" />
              </div>
              <h2>Learning Assistant & Note-taking Tool</h2>
              <p>
                This is the main content area. The sidebar has been completely redesigned with React
                for a modern, interactive experience.
              </p>
              <div className="features">
                <div className="feature">
                  <h3>✨ Modern Sidebar</h3>
                  <p>Clean, organized navigation with collapsible sections</p>
                </div>
                <div className="feature">
                  <h3>🎯 Context Menus</h3>
                  <p>Right-click items for quick actions</p>
                </div>
                <div className="feature">
                  <h3>📁 Drag & Drop</h3>
                  <p>Upload documents by dragging them to the sidebar</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
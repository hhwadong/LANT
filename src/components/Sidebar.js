import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faFolder,
  faComments,
  faUpload,
  faPlus,
  faCog,
  faQuestionCircle,
  faChevronDown,
  faEllipsisVertical,
  faStar,
  faTrash,
  faEdit,
  faCodeMerge,
  faQuestion,
  faComments as faCommentsSolid,
  faBroom,
  faBrain
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({
  isOpen,
  onClose,
  lectures,
  sessions,
  currentLecture,
  currentSession,
  onSelectLecture,
  onSelectSession,
  onCreateLecture,
  onCreateSession,
  onDeleteLecture,
  onDeleteSession,
  onRenameLecture,
  onRenameSession,
  onUpload,
  onClearCache,
  onOpenSettings,
  onMergeSessions,
  onGenerateQuestions,
  onSummarizeConversation,
  onClearConversation,
  currentModel,
  modelParams,
  availableModels,
  onUpdateModel,
  isLoading
}) => {
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleAction = (action, item, type) => {
    closeContextMenu();

    switch (action) {
      case 'delete':
        if (type === 'lecture') {
          onDeleteLecture(item);
        } else if (type === 'session') {
          onDeleteSession(item);
        }
        break;
      case 'edit':
        if (type === 'lecture') {
          onRenameLecture(item);
        } else if (type === 'session') {
          onRenameSession(item);
        }
        break;
      case 'favorite':
        // Handle favorite functionality - could be implemented later
        alert(`Favorite feature for ${type} "${item}" is not yet implemented.`);
        break;
      default:
        console.log(`${action} ${type}:`, item);
    }
  };

  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <FontAwesomeIcon icon={faFolder} />
            </div>
            <h1>LANT</h1>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Workspace Section */}
          <div className="nav-section">
            <div
              className="section-header"
              onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
            >
              <div className="section-title">
                <span>Workspace</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`chevron ${workspaceExpanded ? 'expanded' : ''}`}
                />
              </div>
              <button
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateLecture();
                }}
                title="New Lecture"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {workspaceExpanded && (
              <div className="section-content">
                {isLoading ? (
                  <div className="loading-item">
                    <div className="loading-skeleton" />
                  </div>
                ) : lectures.length === 0 ? (
                  <div className="empty-state">No lectures yet</div>
                ) : (
                  lectures.map((lecture) => (
                    <div
                      key={lecture}
                      className={`nav-item ${currentLecture === lecture ? 'active' : ''}`}
                      onClick={() => onSelectLecture(lecture)}
                      onContextMenu={(e) => handleContextMenu(e, lecture, 'lecture')}
                    >
                      <FontAwesomeIcon icon={faFolder} className="item-icon" />
                      <span className="item-text">{lecture}</span>
                      <div className="item-actions">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, lecture, 'lecture');
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sessions Section */}
          <div className="nav-section">
            <div
              className="section-header"
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
            >
              <div className="section-title">
                <span>Sessions</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`chevron ${sessionsExpanded ? 'expanded' : ''}`}
                />
              </div>
              <button
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  currentLecture ? onCreateSession() : alert('Select a lecture first');
                }}
                disabled={!currentLecture}
                title="New Session"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {sessionsExpanded && (
              <div className="section-content">
                {!currentLecture ? (
                  <div className="empty-state">Select a lecture first</div>
                ) : sessions.length === 0 ? (
                  <div className="empty-state">No sessions yet</div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session}
                      className={`nav-item ${currentSession === session ? 'active' : ''}`}
                      onClick={() => onSelectSession(session)}
                      onContextMenu={(e) => handleContextMenu(e, session, 'session')}
                    >
                      <FontAwesomeIcon icon={faComments} className="item-icon" />
                      <span className="item-text">{session}</span>
                      <div className="item-actions">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, session, 'session');
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="nav-section">
            <div
              className="section-header"
              onClick={() => setDocumentsExpanded(!documentsExpanded)}
            >
              <div className="section-title">
                <span>Documents</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`chevron ${documentsExpanded ? 'expanded' : ''}`}
                />
              </div>
            </div>

            {documentsExpanded && (
              <div className="section-content">
                <div
                  className={`upload-area ${dragActive ? 'drag-active' : ''} ${!currentLecture ? 'disabled' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => currentLecture && fileInputRef.current?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                  <p className="upload-text">
                    {currentLecture
                      ? 'Drop files here or click to upload'
                      : 'Select a lecture to upload documents'
                    }
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept=".pdf,.ppt,.pptx,.docx,.txt,.md,.png,.jpg,.jpeg,.bmp,.tiff,.gif"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="nav-section">
            <div className="exact-model-selector">
              <div className="model-selector-header">
                <FontAwesomeIcon icon={faBrain} className="model-icon" />
                <span>AI Model</span>
              </div>
              <select
                className="exact-model-select"
                value={currentModel || ''}
                onChange={(e) => onUpdateModel(e.target.value, modelParams)}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tools Section */}
          <div className="nav-section">
            <div
              className="section-header"
              onClick={() => setToolsExpanded(!toolsExpanded)}
            >
              <div className="section-title">
                <span>Tools</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`chevron ${toolsExpanded ? 'expanded' : ''}`}
                />
              </div>
            </div>

            {toolsExpanded && (
              <div className="section-content">
                <div className="tools-grid">
                  <button
                    className={`tool-btn ${!currentLecture ? 'disabled' : ''}`}
                    onClick={onMergeSessions}
                    disabled={!currentLecture}
                    title="Merge multiple sessions into one"
                  >
                    <FontAwesomeIcon icon={faCodeMerge} className="tool-icon" />
                    <span className="tool-text">Merge</span>
                  </button>
                  <button
                    className={`tool-btn ${!currentLecture || !currentSession ? 'disabled' : ''}`}
                    onClick={onGenerateQuestions}
                    disabled={!currentLecture || !currentSession}
                    title="Generate study questions from current session"
                  >
                    <FontAwesomeIcon icon={faQuestion} className="tool-icon" />
                    <span className="tool-text">Questions</span>
                  </button>
                  <button
                    className={`tool-btn ${!currentLecture || !currentSession ? 'disabled' : ''}`}
                    onClick={onSummarizeConversation}
                    disabled={!currentLecture || !currentSession}
                    title="Summarize the current conversation"
                  >
                    <FontAwesomeIcon icon={faCommentsSolid} className="tool-icon" />
                    <span className="tool-text">Summary</span>
                  </button>
                  <button
                    className={`tool-btn ${!currentLecture || !currentSession ? 'disabled' : ''}`}
                    onClick={onClearConversation}
                    disabled={!currentLecture || !currentSession}
                    title="Clear all messages in current session"
                  >
                    <FontAwesomeIcon icon={faBroom} className="tool-icon" />
                    <span className="tool-text">Clear</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-item" onClick={onOpenSettings}>
            <FontAwesomeIcon icon={faCog} className="footer-icon" />
            <span>Settings</span>
          </div>
          <div className="footer-item" onClick={onClearCache}>
            <FontAwesomeIcon icon={faTrash} className="footer-icon" />
            <span>Clear Cache</span>
          </div>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
        >
          <div
            className="context-menu-item"
            onClick={() => handleAction('edit', contextMenu.item, contextMenu.type)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Rename</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('favorite', contextMenu.item, contextMenu.type)}
          >
            <FontAwesomeIcon icon={faStar} />
            <span>Add to Favorites</span>
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item danger"
            onClick={() => handleAction('delete', contextMenu.item, contextMenu.type)}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
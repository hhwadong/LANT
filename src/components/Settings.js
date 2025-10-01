import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faBrain, faSlidersH, faInfoCircle, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import './Settings.css';

const Settings = ({ isOpen, onClose, currentModel, modelParams, availableModels, onUpdateModel }) => {
  const [localModel, setLocalModel] = useState(currentModel || '');
  const [localParams, setLocalParams] = useState({
    temperature: modelParams?.temperature || 0.7,
    top_p: modelParams?.top_p || 0.9,
    num_predict: modelParams?.num_predict || 2048
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('model');
  const [documentInfo, setDocumentInfo] = useState(null);

  useEffect(() => {
    if (currentModel) {
      setLocalModel(currentModel);
    }
    if (modelParams) {
      setLocalParams(modelParams);
    }
  }, [currentModel, modelParams]);

  useEffect(() => {
    if (isOpen && activeTab === 'documents') {
      loadDocumentInfo();
    }
  }, [isOpen, activeTab]);

  const handleSaveModel = async () => {
    setIsLoading(true);
    try {
      await onUpdateModel(localModel, localParams);
      onClose();
    } catch (error) {
      console.error('Failed to save model settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamChange = (param, value) => {
    setLocalParams(prev => ({
      ...prev,
      [param]: parseFloat(value)
    }));
  };

  
  const loadDocumentInfo = async () => {
    try {
      const response = await fetch('/api/documents/info');
      const result = await response.json();
      if (result.success) {
        setDocumentInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to load document info:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <h2>
            <FontAwesomeIcon icon={faSlidersH} />
            Settings
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            <FontAwesomeIcon icon={faBrain} />
            AI Model
          </button>
          <button
            className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <FontAwesomeIcon icon={faSlidersH} />
            Advanced
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FontAwesomeIcon icon={faFileAlt} />
            Documents
          </button>
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            About
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'model' && (
            <div className="tab-content">
              <div className="setting-group">
                <label>AI Model</label>
                <select
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  className="model-select"
                >
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label>Temperature ({localParams.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localParams.temperature}
                  onChange={(e) => handleParamChange('temperature', e.target.value)}
                  className="range-slider"
                />
                <div className="range-labels">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Top-P ({localParams.top_p})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localParams.top_p}
                  onChange={(e) => handleParamChange('top_p', e.target.value)}
                  className="range-slider"
                />
                <div className="range-labels">
                  <span>Focused</span>
                  <span>Diverse</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Max Tokens ({localParams.num_predict})</label>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={localParams.num_predict}
                  onChange={(e) => handleParamChange('num_predict', e.target.value)}
                  className="range-slider"
                />
                <div className="range-labels">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="setting-group">
                <label>Cache Management</label>
                <div className="cache-info">
                  <p>Document caching is enabled for better performance.</p>
                  <p>Cached documents are processed faster on subsequent loads.</p>
                </div>
              </div>

              <div className="setting-group">
                <label>Conversation Context</label>
                <div className="context-info">
                  <p>Long conversations are automatically summarized to maintain context.</p>
                  <p>Context limit: 12 messages before summarization.</p>
                </div>
              </div>

              <div className="setting-group">
                <label>Document Processing</label>
                <div className="document-info">
                  <p>Supported formats: PDF, PPT/PPTX, DOCX, TXT, Markdown, Images</p>
                  <p>OCR enabled for image and embedded text extraction.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="tab-content">
              <div className="setting-group">
                <label>Document Statistics</label>
                {documentInfo ? (
                  <div className="document-stats">
                    <div className="stats-overview">
                      <div className="stat-item">
                        <h4>Total Documents</h4>
                        <p>{documentInfo.total_documents}</p>
                      </div>
                      <div className="stat-item">
                        <h4>Total Size</h4>
                        <p>{formatBytes(documentInfo.total_size)}</p>
                      </div>
                      <div className="stat-item">
                        <h4>Cache Files</h4>
                        <p>{documentInfo.cache_info.file_count || 0}</p>
                      </div>
                      <div className="stat-item">
                        <h4>Cache Size</h4>
                        <p>{formatBytes(documentInfo.cache_info.total_size || 0)}</p>
                      </div>
                    </div>

                    <div className="file-types">
                      <h4>Files by Type</h4>
                      <div className="type-grid">
                        {Object.entries(documentInfo.document_stats).map(([type, count]) => (
                          <div key={type} className="type-item">
                            <span className="file-type">.{type}</span>
                            <span className="file-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="supported-formats">
                      <h4>Supported Formats</h4>
                      <div className="formats-list">
                        {documentInfo.supported_formats.map(format => (
                          <span key={format} className="format-tag">.{format}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loading document information...</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="system-info">
                <h3>System Status</h3>
                <div className="info-item">
                  <span>Backend:</span>
                  <span>Flask API</span>
                </div>
                <div className="info-item">
                  <span>AI Engine:</span>
                  <span>Ollama</span>
                </div>
                <div className="info-item">
                  <span>Cache:</span>
                  <span>Enabled</span>
                </div>
                <div className="info-item">
                  <span>Document Formats:</span>
                  <span>6+ supported</span>
                </div>
              </div>

              <div className="features-list">
                <h3>Available Features</h3>
                <ul>
                  <li>✅ Multi-format document processing</li>
                  <li>✅ OCR for images and PDFs</li>
                  <li>✅ Conversation history</li>
                  <li>✅ Session management</li>
                  <li>✅ Model parameter tuning</li>
                  <li>✅ Document caching</li>
                  <li>✅ Session merging</li>
                  <li>✅ Question generation</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSaveModel}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faSave} />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Settings;
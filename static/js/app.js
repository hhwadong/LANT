class LANTApp {
    constructor() {
        this.currentLecture = null;
        this.currentSession = null;
        this.lectures = [];
        this.sessions = [];
        this.apiBase = '/api';
        this.isDarkMode = false;
        this.isSidebarVisible = true;

        this.init();
    }

    init() {
        this.loadThemePreference();
        this.loadSidebarPreference();
        this.bindEvents();
        this.updateUIState(); // Initialize upload zone state
        this.loadLectures();
        this.loadModelInfo();
        this.checkStatus();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebar-close').addEventListener('click', () => this.hideSidebar());

        // Lecture events
        document.getElementById('create-lecture-btn').addEventListener('click', () => this.showCreateLectureModal());
        document.getElementById('save-lecture-btn').addEventListener('click', () => this.createLecture());
        document.getElementById('cancel-lecture-btn').addEventListener('click', () => this.hideModal('create-lecture-modal'));
        document.getElementById('lecture-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createLecture();
        });

        // Session events
        document.getElementById('create-session-btn').addEventListener('click', () => this.showCreateSessionModal());
        document.getElementById('save-session-btn').addEventListener('click', () => this.createSession());
        document.getElementById('cancel-session-btn').addEventListener('click', () => this.hideModal('create-session-modal'));
        document.getElementById('session-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createSession();
        });

        // Chat events
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());

        // File upload
        document.getElementById('upload-area').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));

        // Drag and drop
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e);
        });

        // Control buttons
        document.getElementById('generate-questions-btn').addEventListener('click', () => this.generateQuestions());
        document.getElementById('merge-sessions-btn').addEventListener('click', () => this.mergeSessions());
        document.getElementById('clear-cache-btn').addEventListener('click', () => this.clearCache());

        // Model selection
        document.getElementById('model-select').addEventListener('change', (e) => this.updateModel(e.target.value));

        // Modal click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // API Methods
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                if (data instanceof FormData) {
                    options.body = data;
                    delete options.headers['Content-Type'];
                } else {
                    options.body = JSON.stringify(data);
                }
            }

            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }

            return result;
        } catch (error) {
            this.showError(error.message);
            throw error;
        }
    }

    async loadLectures() {
        try {
            const result = await this.apiCall('/lectures');
            this.lectures = result.data;
            this.renderLectures();
        } catch (error) {
            console.error('Failed to load lectures:', error);
        }
    }

    async loadSessions(lectureName) {
        try {
            const result = await this.apiCall(`/lectures/${encodeURIComponent(lectureName)}/sessions`);
            this.sessions = result.data;
            this.renderSessions();
            this.updateSessionControls();
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    }

    async loadSessionMessages(lectureName, sessionName) {
        try {
            const result = await this.apiCall(`/sessions/${encodeURIComponent(lectureName)}/${encodeURIComponent(sessionName)}`);
            const sessionData = result.data;
            this.renderMessages(sessionData.messages);
        } catch (error) {
            console.error('Failed to load session messages:', error);
        }
    }

    async createLecture() {
        const name = document.getElementById('lecture-name-input').value.trim();
        if (!name) return;

        try {
            await this.apiCall('/lectures', 'POST', { name });
            this.hideModal('create-lecture-modal');
            document.getElementById('lecture-name-input').value = '';
            await this.loadLectures();
        } catch (error) {
            console.error('Failed to create lecture:', error);
        }
    }

    async createSession() {
        const name = document.getElementById('session-name-input').value.trim();
        if (!this.currentLecture) return;

        try {
            await this.apiCall(`/lectures/${encodeURIComponent(this.currentLecture)}/sessions`, 'POST', {
                name: name || null
            });
            this.hideModal('create-session-modal');
            document.getElementById('session-name-input').value = '';
            await this.loadSessions(this.currentLecture);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        if (!message || !this.currentLecture || !this.currentSession) return;

        const messageElement = this.addMessage(message, 'user');
        input.value = '';
        this.setSendButtonState(false);

        try {
            const result = await this.apiCall(
                `/sessions/${encodeURIComponent(this.currentLecture)}/${encodeURIComponent(this.currentSession)}/messages`,
                'POST',
                { message }
            );

            this.addMessage(result.data.response, 'assistant');
        } catch (error) {
            console.error('Failed to send message:', error);
            messageElement.classList.add('error');
            messageElement.innerHTML += '<br><small>Error: Failed to send message</small>';
        } finally {
            this.setSendButtonState(true);
        }
    }

    async handleFileUpload(event) {
        const files = event.target.files || event.dataTransfer.files;
        if (!files.length) return;

        // Validate that a lecture is selected
        if (!this.currentLecture) {
            this.showError('Please select a lecture before uploading documents');
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append('file', file);
        }

        this.showLoading();
        try {
            await this.apiCall(
                `/lectures/${encodeURIComponent(this.currentLecture)}/documents`,
                'POST',
                formData
            );

            // Reset file input
            document.getElementById('file-input').value = '';
            this.showSuccess('Files uploaded successfully');
        } catch (error) {
            console.error('Failed to upload files:', error);
        } finally {
            this.hideLoading();
        }
    }

    async generateQuestions() {
        if (!this.currentLecture) return;

        this.showLoading();
        try {
            const scope = this.currentSession ? 'current' : 'all';
            const result = await this.apiCall(
                `/lectures/${encodeURIComponent(this.currentLecture)}/questions`,
                'POST',
                { scope }
            );

            const questions = result.data.questions;
            const messageElement = this.addMessage('Generated Study Questions:', 'assistant');

            const questionsHtml = questions.map((q, i) =>
                `<div class="question-item"><strong>${i + 1}.</strong> ${q}</div>`
            ).join('');

            messageElement.innerHTML += `<div class="questions-list">${questionsHtml}</div>`;
        } catch (error) {
            console.error('Failed to generate questions:', error);
        } finally {
            this.hideLoading();
        }
    }

    async mergeSessions() {
        if (!this.currentLecture) return;

        if (!confirm('Are you sure you want to merge all sessions in this lecture?')) return;

        this.showLoading();
        try {
            await this.apiCall(`/lectures/${encodeURIComponent(this.currentLecture)}/sessions/merge`, 'POST');
            await this.loadSessions(this.currentLecture);
            this.showSuccess('Sessions merged successfully');
        } catch (error) {
            console.error('Failed to merge sessions:', error);
        } finally {
            this.hideLoading();
        }
    }

    async clearCache() {
        if (!confirm('Are you sure you want to clear the cache?')) return;

        try {
            await this.apiCall('/cache', 'DELETE');
            this.showSuccess('Cache cleared successfully');
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    async updateModel(model) {
        try {
            await this.apiCall('/model', 'PUT', { model });
            this.showSuccess('Model updated successfully');
        } catch (error) {
            console.error('Failed to update model:', error);
            // Reset select on error
            document.getElementById('model-select').value = this.currentModel;
        }
    }

    async checkStatus() {
        try {
            const result = await this.apiCall('/status');
            // Update status indicator if needed
        } catch (error) {
            console.error('Status check failed:', error);
            document.getElementById('status-indicator').innerHTML =
                '<i class="fas fa-circle text-danger"></i> Disconnected';
        }
    }

    async loadModelInfo() {
        try {
            const result = await this.apiCall('/model');
            const modelInfo = result.data;

            document.getElementById('model-select').value = modelInfo.model;
            this.currentModel = modelInfo.model;

        document.getElementById('model-info').textContent = modelInfo.model;
        } catch (error) {
            console.error('Failed to load model info:', error);
        }
    }

    // UI Methods
    renderLectures() {
        const container = document.getElementById('lectures-list');

        if (!this.lectures.length) {
            container.innerHTML = '<div class="nav-empty">No lectures yet</div>';
            return;
        }

        container.innerHTML = this.lectures.map(lecture => `
            <div class="nav-item ${this.currentLecture === lecture ? 'active' : ''}"
                 onclick="app.selectLecture('${lecture}')">
                <i class="fas fa-folder"></i>
                <span>${lecture}</span>
            </div>
        `).join('');
    }

    renderSessions() {
        const container = document.getElementById('sessions-list');

        if (!this.sessions.length) {
            container.innerHTML = '<div class="nav-empty">No sessions yet</div>';
            return;
        }

        container.innerHTML = this.sessions.map(session => `
            <div class="nav-item ${this.currentSession === session ? 'active' : ''}"
                 onclick="app.selectSession('${session}')">
                <i class="fas fa-comments"></i>
                <span>${session}</span>
            </div>
        `).join('');
    }

    renderMessages(messages) {
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';

        if (!messages || !messages.length) {
            container.innerHTML = `
                <div class="welcome-screen">
                    <div class="welcome-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h2>Session Started</h2>
                    <p>No messages yet. Start a conversation!</p>
                </div>
            `;
            return;
        }

        messages.forEach(msg => {
            const role = msg.role === 'user' ? 'user' : 'assistant';
            this.addMessage(msg.content, role, false);
        });

        container.scrollTop = container.scrollHeight;
    }

    addMessage(content, role, addToDom = true) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const timestamp = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        if (addToDom) {
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        }

        return messageDiv;
    }

    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    selectLecture(lectureName) {
        this.currentLecture = lectureName;
        this.currentSession = null;

        document.getElementById('create-session-btn').disabled = false;
        document.getElementById('generate-questions-btn').disabled = false;
        document.getElementById('merge-sessions-btn').disabled = false;
        document.getElementById('page-title').textContent = lectureName;

        this.renderLectures();
        this.loadSessions(lectureName);
        this.updateUIState(); // Update upload zone state

        // Clear chat area
        document.getElementById('chat-messages').innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <h2>${lectureName}</h2>
                <p>Select a session to start chatting</p>
            </div>
        `;

        // Disable chat input
        document.getElementById('message-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
    }

    selectSession(sessionName) {
        this.currentSession = sessionName;
        this.renderSessions();
        this.loadSessionMessages(this.currentLecture, sessionName);
        document.getElementById('page-title').textContent = `${this.currentLecture} - ${sessionName}`;

        // Enable chat input
        document.getElementById('message-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
    }

    updateSessionControls() {
        const hasSessions = this.sessions.length > 0;
        document.getElementById('generate-questions-btn').disabled = !hasSessions;
        document.getElementById('merge-sessions-btn').disabled = !hasSessions;
    }

    setSendButtonState(enabled) {
        document.getElementById('send-btn').disabled = !enabled;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        const input = modal.querySelector('input');
        if (input) input.focus();
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        const input = modal.querySelector('input');
        if (input) input.value = '';
    }

    showCreateLectureModal() {
        this.showModal('create-lecture-modal');
    }

    showCreateSessionModal() {
        this.showModal('create-session-modal');
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showError(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    showSuccess(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Theme Management
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    applyTheme() {
        const html = document.documentElement;
        const themeIcon = document.querySelector('#theme-toggle i');

        if (this.isDarkMode) {
            html.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        } else {
            html.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Update UI state based on lecture selection
    updateUIState() {
        const uploadArea = document.getElementById('upload-area');
        const uploadText = uploadArea.querySelector('p');

        if (this.currentLecture) {
            uploadArea.classList.remove('disabled');
            uploadText.textContent = 'Drop files here or click to upload';
        } else {
            uploadArea.classList.add('disabled');
            uploadText.textContent = 'Select a lecture first to upload documents';
        }
    }

    // Sidebar Management
    toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
        this.applySidebarState();
        localStorage.setItem('sidebarVisible', this.isSidebarVisible);
    }

    hideSidebar() {
        this.isSidebarVisible = false;
        this.applySidebarState();
        localStorage.setItem('sidebarVisible', false);
    }

    showSidebar() {
        this.isSidebarVisible = true;
        this.applySidebarState();
        localStorage.setItem('sidebarVisible', true);
    }

    applySidebarState() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (this.isSidebarVisible) {
            sidebar.classList.remove('hidden');
            mainContent.classList.remove('sidebar-hidden');
            sidebarToggle.classList.remove('sidebar-hidden');
        } else {
            sidebar.classList.add('hidden');
            mainContent.classList.add('sidebar-hidden');
            sidebarToggle.classList.add('sidebar-hidden');
        }
    }

    loadSidebarPreference() {
        const savedState = localStorage.getItem('sidebarVisible');
        this.isSidebarVisible = savedState !== 'false'; // Default to visible
        this.applySidebarState();
    }
}

// Initialize the app
const app = new LANTApp();
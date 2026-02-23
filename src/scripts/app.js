/**
 * Personal Assistant Chat Application
 * Main JavaScript file handling chat functionality
 */

class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.isTyping = false;
        this.messageHistory = [];
        this.apiBaseUrl = 'http://localhost:5000';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.adjustTextareaHeight();
        this.checkApiHealth();
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        this.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.toggleSendButton();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Handle paste events for textarea auto-resize
        this.messageInput.addEventListener('paste', () => {
            setTimeout(() => this.adjustTextareaHeight(), 0);
        });
    }

    /**
     * Check if the backend API is available
     */
    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.llm_client_initialized) {
                    console.log('Backend API is healthy and LLM client is initialized');
                } else {
                    console.warn('Backend API is running but LLM client is not initialized');
                }
            } else {
                console.warn('Backend API health check failed');
            }
        } catch (error) {
            console.warn('Backend API is not available:', error.message);
        }
    }

    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    toggleSendButton() {
        const hasContent = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasContent;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Remove welcome message if it exists
        this.removeWelcomeMessage();

        // Add user message
        this.addMessage(message, 'user');
        this.messageHistory.push({ role: 'user', content: message });

        // Clear input
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        this.toggleSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        // Call backend API
        try {
            const response = await this.getAssistantResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'assistant');
            this.messageHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(error.message || 'Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    removeWelcomeMessage() {
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
    }

    addMessage(content, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const avatarSvg = type === 'user' 
            ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

        const timestamp = this.formatTime(new Date());

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${avatarSvg}
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.escapeHtml(content)}</div>
                <span class="message-time">${timestamp}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typingIndicator';
        
        typingElement.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
            </div>
            <div class="typing-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTo({
            top: this.chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Send message to backend API and get assistant response
     * @param {string} userMessage - The user's message
     * @returns {Promise<string>} - The assistant's response
     */
    async getAssistantResponse(userMessage) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            return data.response;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            throw error;
        }
    }

    /**
     * Clear conversation history on both frontend and backend
     */
    async clearConversation() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                this.messageHistory = [];
                this.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            </svg>
                        </div>
                        <h2>Welcome!</h2>
                        <p>I'm your personal assistant. How can I help you today?</p>
                    </div>
                `;
                console.log('Conversation history cleared');
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to clear conversation history');
            }
        } catch (error) {
            console.error('Error clearing conversation:', error.message);
            throw error;
        }
    }
}

// Initialize the chat application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

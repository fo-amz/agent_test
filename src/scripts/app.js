/**
 * Personal Assistant Chat Application
 * Main JavaScript file handling chat functionality with voice support
 */

class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.micButton = document.getElementById('micButton');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.recordingTime = document.getElementById('recordingTime');
        this.voiceResponseToggle = document.getElementById('voiceResponseToggle');
        this.statusText = document.getElementById('statusText');
        
        this.isTyping = false;
        this.messageHistory = [];
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingTimer = null;
        this.recordingSeconds = 0;
        this.voiceResponseEnabled = true;
        this.apiBaseUrl = '';
        this.features = { speech_to_text: false, text_to_speech: false };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.adjustTextareaHeight();
        this.checkServerStatus();
        this.initVoiceToggle();
        this.checkApiHealth();
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/status`);
            if (response.ok) {
                const data = await response.json();
                this.features = data.features;
                this.statusText.textContent = 'Online';
                this.updateVoiceUI();
            }
        } catch (error) {
            this.statusText.textContent = 'Demo Mode';
            this.features = { speech_to_text: false, text_to_speech: false };
            this.updateVoiceUI();
        }
    }

    updateVoiceUI() {
        if (this.micButton) {
            this.micButton.style.display = this.features.speech_to_text ? 'flex' : 'none';
        }
        if (this.voiceResponseToggle) {
            this.voiceResponseToggle.style.display = this.features.text_to_speech ? 'flex' : 'none';
            this.voiceResponseToggle.classList.toggle('active', this.voiceResponseEnabled);
        }
    }

    initVoiceToggle() {
        if (this.voiceResponseToggle) {
            this.voiceResponseToggle.addEventListener('click', () => {
                this.voiceResponseEnabled = !this.voiceResponseEnabled;
                this.voiceResponseToggle.classList.toggle('active', this.voiceResponseEnabled);
            });
        }
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

        this.messageInput.addEventListener('paste', () => {
            setTimeout(() => this.adjustTextareaHeight(), 0);
        });

        // Microphone button events
        if (this.micButton) {
            this.micButton.addEventListener('mousedown', () => this.startRecording());
            this.micButton.addEventListener('mouseup', () => this.stopRecording());
            this.micButton.addEventListener('mouseleave', () => {
                if (this.isRecording) this.stopRecording();
            });
            this.micButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startRecording();
            });
            this.micButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopRecording();
            });
        }
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

    async startRecording() {
        if (this.isRecording || !this.features.speech_to_text) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => this.processRecording();
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateRecordingUI(true);
            this.startRecordingTimer();
        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Please allow microphone access to use voice input.');
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
        this.updateRecordingUI(false);
        this.stopRecordingTimer();
    }

    updateRecordingUI(isRecording) {
        if (this.recordingIndicator) {
            this.recordingIndicator.style.display = isRecording ? 'flex' : 'none';
        }
        if (this.micButton) {
            this.micButton.classList.toggle('recording', isRecording);
            const micIcon = this.micButton.querySelector('.mic-icon');
            const stopIcon = this.micButton.querySelector('.stop-icon');
            if (micIcon) micIcon.style.display = isRecording ? 'none' : 'block';
            if (stopIcon) stopIcon.style.display = isRecording ? 'block' : 'none';
        }
        this.messageInput.style.display = isRecording ? 'none' : 'block';
    }

    startRecordingTimer() {
        this.recordingSeconds = 0;
        this.updateRecordingTime();
        this.recordingTimer = setInterval(() => {
            this.recordingSeconds++;
            this.updateRecordingTime();
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    updateRecordingTime() {
        if (this.recordingTime) {
            const mins = Math.floor(this.recordingSeconds / 60);
            const secs = this.recordingSeconds % 60;
            this.recordingTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }

    async processRecording() {
        if (this.audioChunks.length === 0) return;
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.removeWelcomeMessage();
        this.addMessage('🎤 Voice message', 'user');
        this.showTypingIndicator();
        
        try {
            const response = await this.sendVoiceMessage(audioBlob);
            this.hideTypingIndicator();
            this.addMessage(response.text, 'assistant', response.audio_url);
            this.messageHistory.push({ role: 'assistant', content: response.text });
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I could not process your voice message.', 'assistant');
        }
    }

    async sendVoiceMessage(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('generate_audio', this.voiceResponseEnabled);
        
        const response = await fetch(`${this.apiBaseUrl}/api/chat/voice`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Voice chat failed');
        return response.json();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        this.removeWelcomeMessage();
        this.addMessage(message, 'user');
        this.messageHistory.push({ role: 'user', content: message });

        this.messageInput.value = '';
        this.adjustTextareaHeight();
        this.toggleSendButton();
        this.showTypingIndicator();

        try {
            const response = await this.getAssistantResponse(message);
            this.hideTypingIndicator();
            const audioUrl = response.audio_url || null;
            const text = response.text || response;
            this.addMessage(text, 'assistant', audioUrl);
            this.messageHistory.push({ role: 'assistant', content: text });
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

    addMessage(content, type, audioUrl = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const avatarSvg = type === 'user' 
            ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

        const timestamp = this.formatTime(new Date());
        let audioHtml = '';
        
        if (audioUrl && type === 'assistant') {
            audioHtml = `
                <div class="audio-player">
                    <audio controls src="${this.apiBaseUrl}${audioUrl}"></audio>
                </div>
            `;
        }

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${avatarSvg}
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.escapeHtml(content)}</div>
                ${audioHtml}
                <span class="message-time">${timestamp}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Auto-play audio if enabled
        if (audioUrl && this.voiceResponseEnabled) {
            const audio = messageElement.querySelector('audio');
            if (audio) audio.play().catch(() => {});
        }
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
     * Get assistant response - uses real API if available, falls back to mock
     */
    async getAssistantResponse(userMessage) {
        // Try real API first
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    generate_audio: this.voiceResponseEnabled && this.features.text_to_speech
                })
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('API not available, using mock responses');
        }
        
        // Fallback to mock response
        return this.getMockResponse(userMessage);
    }

    getMockResponse(userMessage) {
        const delay = Math.random() * 2000 + 1000;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ text: this.generateMockText(userMessage), audio_url: null });
            }, delay);
        });
    }

    generateMockText(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        const responses = {
            greeting: [
                "Hello! How can I assist you today?",
                "Hi there! I'm here to help. What can I do for you?",
                "Greetings! What would you like to know?"
            ],
            help: [
                "I'm your personal assistant and I can help you with various tasks. You can ask me questions, get information, or just have a conversation. What would you like to explore?",
                "I'm here to assist you! Feel free to ask me anything - I can help with information, answer questions, or provide guidance on various topics."
            ],
            thanks: [
                "You're welcome! Is there anything else I can help you with?",
                "Happy to help! Let me know if you need anything else.",
                "My pleasure! Feel free to ask if you have more questions."
            ],
            weather: [
                "I don't have access to real-time weather data yet, but once I'm connected to a weather service, I'll be able to give you accurate forecasts. Is there anything else I can help with?",
                "Weather information isn't available in my current setup, but this feature will be added soon. What else can I assist you with?"
            ],
            time: [
                `Based on your device, the current time appears to be ${new Date().toLocaleTimeString()}. Is there anything else you'd like to know?`,
                `It looks like it's ${new Date().toLocaleTimeString()} according to your system. How else can I help?`
            ],
            name: [
                "I'm your Personal Assistant, designed to help you with various tasks and questions. You can call me PA if you'd like!",
                "I go by Personal Assistant. I'm here to make your life easier by answering questions and helping with tasks."
            ],
            capabilities: [
                "I'm a chat interface designed to assist you with various queries. Currently, I'm running in demo mode with simulated responses. Once connected to a backend, I'll be able to provide much more comprehensive assistance!",
                "Right now, I'm demonstrating the chat interface capabilities. In the full version, I'll be able to help with a wide range of tasks, from answering questions to providing personalized recommendations."
            ],
            default: [
                "That's an interesting question! Once I'm fully connected to the backend services, I'll be able to provide more detailed and accurate responses. Is there anything specific I can help clarify?",
                "I appreciate your message. In the full implementation, I'll have access to more resources to give you comprehensive answers. What else would you like to explore?",
                "Thanks for reaching out! While I'm currently in demo mode, I'm designed to handle a wide variety of questions and tasks. Feel free to ask anything!",
                "I'm here to help! Although I'm running with simulated responses right now, the full version will provide much more detailed assistance. What else can I do for you?"
            ]
        };

        // Determine response category
        let category = 'default';
        
        if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))/.test(lowerMessage)) {
            category = 'greeting';
        } else if (/help|assist|what can you do|how do you work/.test(lowerMessage)) {
            category = 'help';
        } else if (/thank|thanks|appreciate/.test(lowerMessage)) {
            category = 'thanks';
        } else if (/weather|forecast|temperature|rain|sunny|cloudy/.test(lowerMessage)) {
            category = 'weather';
        } else if (/time|what.*time|current.*time/.test(lowerMessage)) {
            category = 'time';
        } else if (/your name|who are you|what are you/.test(lowerMessage)) {
            category = 'name';
        } else if (/what can you|capabilities|features|abilities/.test(lowerMessage)) {
            category = 'capabilities';
        }

        // Select random response from category
        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
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

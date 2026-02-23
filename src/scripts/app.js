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
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.adjustTextareaHeight();
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

        // Simulate backend response (mock functionality)
        try {
            const response = await this.getAssistantResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'assistant');
            this.messageHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
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
     * Mock backend integration - simulates assistant responses
     * Replace this method with actual API calls when backend is ready
     */
    async getAssistantResponse(userMessage) {
        // Simulate network delay (1-3 seconds)
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Mock responses based on user input
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
}

// Initialize the chat application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

const GEMINI_API_KEY = 'AIzaSyC14yomvhBvUNn5ZZGNzmRHVfcK8sNosbU';

class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.userInput = document.getElementById('user-message');
        
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add initial welcome message
        this.addMessage({
            role: 'assistant',
            content: 'Hello! I\'m your eco-friendly AI assistant. Ask me anything about sustainable living!'
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage({
            role: 'user',
            content: message
        });

        this.userInput.value = '';
        this.userInput.disabled = true;

        try {
            // Add loading indicator
            const loadingId = this.addLoadingMessage();

            // Make API call to Gemini
            const response = await this.getGeminiResponse(message);

            // Remove loading indicator
            this.removeLoadingMessage(loadingId);

            // Add AI response
            this.addMessage({
                role: 'assistant',
                content: response
            });
        } catch (error) {
            console.error('Error:', error);
            this.addMessage({
                role: 'error',
                content: 'Sorry, there was an error processing your request.'
            });
        } finally {
            this.userInput.disabled = false;
            this.userInput.focus();
        }
    }

    addMessage({ role, content }) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${role === 'assistant' ? '<i class="fas fa-leaf"></i>' : ''}
                <p>${content}</p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        loadingDiv.id = loadingId;
        loadingDiv.className = 'message assistant-message loading';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Thinking...</p>
            </div>
        `;
        this.chatMessages.appendChild(loadingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return loadingId;
    }

    removeLoadingMessage(loadingId) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    async getGeminiResponse(message) {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
        
        try {
            const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an eco-friendly AI assistant helping users with sustainable living advice. 
                                  User message: ${message}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
}); 
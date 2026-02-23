# Personal Assistant Chat Interface

A modern, responsive chat web interface for a personal assistant application.

## Features

- **Chat Message Display**: Conversation history with distinct styling for user messages and assistant responses
- **Text Input**: Input field with send button for message submission
- **Loading States**: Visual typing indicator showing when the assistant is processing
- **Auto-Scroll**: Automatically scrolls to show the most recent messages
- **Responsive Design**: Mobile-friendly interface that works across different screen sizes
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Mock Responses**: Simulated assistant responses for testing (backend placeholder)

## Project Structure

```
src/
├── index.html          # Main HTML entry point
├── styles/
│   └── main.css        # All styling including responsive breakpoints
├── scripts/
│   └── app.js          # Chat functionality and mock backend
└── assets/             # Static assets (images, icons)
```

## Getting Started

### Running Locally

1. Open `src/index.html` in a web browser, or
2. Use a local development server:
   ```bash
   # Using Python
   cd src && python -m http.server 8000

   # Using Node.js (npx)
   npx serve src
   ```
3. Navigate to `http://localhost:8000`

## Backend Integration

The chat interface includes mock functionality that simulates assistant responses. To integrate with a real backend:

1. Locate the `getAssistantResponse` method in `src/scripts/app.js`
2. Replace the mock implementation with actual API calls:

```javascript
async getAssistantResponse(userMessage) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: userMessage,
            history: this.messageHistory
        })
    });
    
    const data = await response.json();
    return data.response;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

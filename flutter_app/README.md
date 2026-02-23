# AI Assistant Chat - Flutter App

A Flutter front-end application that replicates the functionality and user experience of the HTML/JavaScript chat interface.

## Features

- **Chat Interface**: Full-featured chat screen with user and assistant messages
- **Dark Theme**: Matches the dark mode styling from the original CSS
- **Responsive Design**: Adapts to different screen sizes (mobile, tablet, desktop)
- **Typing Indicator**: Animated dots when waiting for assistant response
- **Auto-scroll**: Automatically scrolls to the latest message
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Welcome Message**: Displayed when chat is empty
- **Mock Responses**: Simulated assistant responses for demonstration

## Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── models/
│   │   └── message.dart          # ChatMessage model
│   ├── screens/
│   │   └── chat_screen.dart      # Main chat screen
│   ├── services/
│   │   └── chat_service.dart     # Mock response service
│   ├── theme/
│   │   └── app_theme.dart        # Theme configuration
│   └── widgets/
│       ├── chat_header.dart      # Header with assistant info
│       ├── chat_input.dart       # Text input area
│       ├── message_bubble.dart   # Message bubble widget
│       ├── typing_indicator.dart # Typing animation
│       ├── welcome_message.dart  # Welcome screen
│       └── widgets.dart          # Barrel export
├── web/
│   ├── index.html               # Web entry point
│   └── manifest.json            # PWA manifest
├── pubspec.yaml                 # Dependencies
└── analysis_options.yaml        # Linter configuration
```

## Getting Started

### Prerequisites

- Flutter SDK (>= 3.0.0)
- Dart SDK (>= 3.0.0)

### Installation

1. Navigate to the flutter_app directory:
   ```bash
   cd flutter_app
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   # For web
   flutter run -d chrome
   
   # For mobile (with connected device)
   flutter run
   ```

## Building

### Web Build
```bash
flutter build web
```

### Mobile Builds
```bash
# Android
flutter build apk

# iOS
flutter build ios
```

## Customization

### Theme Colors

The theme colors are defined in `lib/theme/app_theme.dart`. Key colors include:

- `primaryColor`: #6366F1 (Purple)
- `bgPrimaryDark`: #0F172A (Dark background)
- `bgSecondaryDark`: #1E293B (Card background)
- `successColor`: #22C55E (Online status)

### Mock Responses

The mock responses are defined in `lib/services/chat_service.dart`. To integrate with a real backend:

1. Replace the `ChatService.getResponse()` method with actual API calls
2. Update the response parsing logic as needed

## Features Matching Original Interface

| Feature | Status |
|---------|--------|
| Header with avatar and status | ✅ |
| Scrollable messages area | ✅ |
| User/Assistant message bubbles | ✅ |
| Timestamps on messages | ✅ |
| Welcome message | ✅ |
| Text input with send button | ✅ |
| Enter to send | ✅ |
| Shift+Enter for new line | ✅ |
| Typing indicator animation | ✅ |
| Auto-scroll to latest | ✅ |
| Dark theme styling | ✅ |
| Responsive design | ✅ |
| Mock responses | ✅ |

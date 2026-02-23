import 'dart:math';

/// Mock chat service that simulates assistant responses.
/// Replace this implementation with actual API calls when backend is ready.
class ChatService {
  final Random _random = Random();

  final Map<String, List<String>> _responses = {
    'greeting': [
      "Hello! How can I assist you today?",
      "Hi there! I'm here to help. What can I do for you?",
      "Greetings! What would you like to know?"
    ],
    'help': [
      "I'm your personal assistant and I can help you with various tasks. You can ask me questions, get information, or just have a conversation. What would you like to explore?",
      "I'm here to assist you! Feel free to ask me anything - I can help with information, answer questions, or provide guidance on various topics."
    ],
    'thanks': [
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Let me know if you need anything else.",
      "My pleasure! Feel free to ask if you have more questions."
    ],
    'weather': [
      "I don't have access to real-time weather data yet, but once I'm connected to a weather service, I'll be able to give you accurate forecasts. Is there anything else I can help with?",
      "Weather information isn't available in my current setup, but this feature will be added soon. What else can I assist you with?"
    ],
    'time': [
      "I can see the current time based on your device. Is there anything else you'd like to know?",
      "Time information is available from your device. How else can I help?"
    ],
    'name': [
      "I'm your AI Assistant, designed to help you with various tasks and questions. You can call me AI if you'd like!",
      "I go by AI Assistant. I'm here to make your life easier by answering questions and helping with tasks."
    ],
    'capabilities': [
      "I'm a chat interface designed to assist you with various queries. Currently, I'm running in demo mode with simulated responses. Once connected to a backend, I'll be able to provide much more comprehensive assistance!",
      "Right now, I'm demonstrating the chat interface capabilities. In the full version, I'll be able to help with a wide range of tasks, from answering questions to providing personalized recommendations."
    ],
    'default': [
      "That's an interesting question! Once I'm fully connected to the backend services, I'll be able to provide more detailed and accurate responses. Is there anything specific I can help clarify?",
      "I appreciate your message. In the full implementation, I'll have access to more resources to give you comprehensive answers. What else would you like to explore?",
      "Thanks for reaching out! While I'm currently in demo mode, I'm designed to handle a wide variety of questions and tasks. Feel free to ask anything!",
      "I'm here to help! Although I'm running with simulated responses right now, the full version will provide much more detailed assistance. What else can I do for you?"
    ],
  };

  /// Determines the response category based on user message content.
  String _determineCategory(String message) {
    final lowerMessage = message.toLowerCase();

    if (RegExp(r'^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))')
        .hasMatch(lowerMessage)) {
      return 'greeting';
    } else if (RegExp(r'help|assist|what can you do|how do you work')
        .hasMatch(lowerMessage)) {
      return 'help';
    } else if (RegExp(r'thank|thanks|appreciate').hasMatch(lowerMessage)) {
      return 'thanks';
    } else if (RegExp(r'weather|forecast|temperature|rain|sunny|cloudy')
        .hasMatch(lowerMessage)) {
      return 'weather';
    } else if (RegExp(r'time|what.*time|current.*time').hasMatch(lowerMessage)) {
      return 'time';
    } else if (RegExp(r'your name|who are you|what are you')
        .hasMatch(lowerMessage)) {
      return 'name';
    } else if (RegExp(r'what can you|capabilities|features|abilities')
        .hasMatch(lowerMessage)) {
      return 'capabilities';
    }

    return 'default';
  }

  /// Gets a mock assistant response with simulated network delay.
  /// 
  /// [userMessage] The message from the user to respond to.
  /// Returns a Future that completes with the assistant's response after a delay.
  Future<String> getResponse(String userMessage) async {
    // Simulate network delay (1-3 seconds)
    final delay = Duration(milliseconds: _random.nextInt(2000) + 1000);
    await Future.delayed(delay);

    final category = _determineCategory(userMessage);
    final categoryResponses = _responses[category] ?? _responses['default']!;

    return categoryResponses[_random.nextInt(categoryResponses.length)];
  }
}

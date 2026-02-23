import 'package:flutter/material.dart';
import '../models/message.dart';
import '../services/chat_service.dart';
import '../theme/app_theme.dart';
import '../widgets/chat_header.dart';
import '../widgets/chat_input.dart';
import '../widgets/message_bubble.dart';
import '../widgets/typing_indicator.dart';
import '../widgets/welcome_message.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<ChatMessage> _messages = [];
  final ChatService _chatService = ChatService();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String content) async {
    if (content.trim().isEmpty || _isTyping) return;

    final userMessage = ChatMessage(
      content: content,
      type: MessageType.user,
    );

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _scrollToBottom();

    try {
      final response = await _chatService.getResponse(content);
      
      if (mounted) {
        final assistantMessage = ChatMessage(
          content: response,
          type: MessageType.assistant,
        );

        setState(() {
          _isTyping = false;
          _messages.add(assistantMessage);
        });

        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        final errorMessage = ChatMessage(
          content: 'Sorry, I encountered an error. Please try again.',
          type: MessageType.assistant,
        );

        setState(() {
          _isTyping = false;
          _messages.add(errorMessage);
        });

        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppTheme.bgPrimaryDark : AppTheme.bgPrimaryLight,
      body: Column(
        children: [
          const ChatHeader(),
          Expanded(
            child: _messages.isEmpty && !_isTyping
                ? const WelcomeMessage()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 20,
                    ),
                    itemCount: _messages.length + (_isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index < _messages.length) {
                        return MessageBubble(message: _messages[index]);
                      } else {
                        return const TypingIndicator();
                      }
                    },
                  ),
          ),
          ChatInput(
            onSendMessage: _sendMessage,
            isTyping: _isTyping,
          ),
        ],
      ),
    );
  }
}

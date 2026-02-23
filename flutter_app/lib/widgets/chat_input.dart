import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

class ChatInput extends StatefulWidget {
  final Function(String) onSendMessage;
  final bool isTyping;

  const ChatInput({
    super.key,
    required this.onSendMessage,
    this.isTyping = false,
  });

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _hasContent = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_updateHasContent);
  }

  @override
  void dispose() {
    _controller.removeListener(_updateHasContent);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _updateHasContent() {
    final hasContent = _controller.text.trim().isNotEmpty;
    if (hasContent != _hasContent) {
      setState(() {
        _hasContent = hasContent;
      });
    }
  }

  void _sendMessage() {
    final message = _controller.text.trim();
    if (message.isNotEmpty && !widget.isTyping) {
      widget.onSendMessage(message);
      _controller.clear();
      _focusNode.requestFocus();
    }
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (event is KeyDownEvent) {
      final isEnter = event.logicalKey == LogicalKeyboardKey.enter ||
          event.logicalKey == LogicalKeyboardKey.numpadEnter;
      final isShiftPressed = HardwareKeyboard.instance.isShiftPressed;

      if (isEnter && !isShiftPressed) {
        _sendMessage();
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 768;

    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 12 : 16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.bgSecondaryDark : AppTheme.bgSecondaryLight,
        border: Border(
          top: BorderSide(
            color: isDark ? AppTheme.borderColorDark : AppTheme.borderColorLight,
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              constraints: const BoxConstraints(maxWidth: 900),
              decoration: BoxDecoration(
                color:
                    isDark ? AppTheme.bgTertiaryDark : AppTheme.bgTertiaryLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _focusNode.hasFocus
                      ? AppTheme.primaryColor
                      : Colors.transparent,
                  width: 2,
                ),
              ),
              padding: EdgeInsets.only(
                left: isSmallScreen ? 12 : 16,
                right: isSmallScreen ? 6 : 8,
                top: isSmallScreen ? 6 : 8,
                bottom: isSmallScreen ? 6 : 8,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Focus(
                      onKeyEvent: _handleKeyEvent,
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        maxLines: 5,
                        minLines: 1,
                        textInputAction: TextInputAction.newline,
                        keyboardType: TextInputType.multiline,
                        style: TextStyle(
                          fontSize: isSmallScreen ? 16 : 15,
                          color: isDark
                              ? AppTheme.textPrimaryDark
                              : AppTheme.textPrimaryLight,
                          height: 1.5,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Type your message...',
                          hintStyle: TextStyle(
                            color: isDark
                                ? AppTheme.textMutedDark
                                : AppTheme.textMutedLight,
                          ),
                          border: InputBorder.none,
                          filled: false,
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 6),
                          isDense: true,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: isSmallScreen ? 40 : 44,
                    height: isSmallScreen ? 40 : 44,
                    child: Material(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        onTap: (_hasContent && !widget.isTyping)
                            ? _sendMessage
                            : null,
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 150),
                          opacity: (_hasContent && !widget.isTyping) ? 1.0 : 0.5,
                          child: Icon(
                            Icons.send,
                            color: Colors.white,
                            size: isSmallScreen ? 20 : 22,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (!isSmallScreen) ...[
              const SizedBox(height: 8),
              Text(
                'Press Enter to send, Shift+Enter for new line',
                style: TextStyle(
                  fontSize: 12,
                  color:
                      isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

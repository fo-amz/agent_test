import 'package:flutter/material.dart';

class AppTheme {
  // Dark theme colors (matching the CSS dark mode)
  static const Color primaryColor = Color(0xFF6366F1);
  static const Color primaryHover = Color(0xFF4F46E5);
  static const Color primaryLight = Color(0x336366F1);

  // Dark theme background colors
  static const Color bgPrimaryDark = Color(0xFF0F172A);
  static const Color bgSecondaryDark = Color(0xFF1E293B);
  static const Color bgTertiaryDark = Color(0xFF334155);

  // Dark theme text colors
  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark = Color(0xFF64748B);

  // Light theme background colors
  static const Color bgPrimaryLight = Color(0xFFF8FAFC);
  static const Color bgSecondaryLight = Color(0xFFFFFFFF);
  static const Color bgTertiaryLight = Color(0xFFF1F5F9);

  // Light theme text colors
  static const Color textPrimaryLight = Color(0xFF1E293B);
  static const Color textSecondaryLight = Color(0xFF64748B);
  static const Color textMutedLight = Color(0xFF94A3B8);

  // Message colors
  static const Color userMessageBg = Color(0xFF6366F1);
  static const Color userMessageText = Color(0xFFFFFFFF);
  static const Color assistantMessageBgLight = Color(0xFFFFFFFF);
  static const Color assistantMessageBgDark = Color(0xFF1E293B);
  static const Color assistantMessageTextLight = Color(0xFF1E293B);
  static const Color assistantMessageTextDark = Color(0xFFF1F5F9);

  // Status colors
  static const Color successColor = Color(0xFF22C55E);
  static const Color errorColor = Color(0xFFEF4444);

  // Border colors
  static const Color borderColorLight = Color(0xFFE2E8F0);
  static const Color borderColorDark = Color(0xFF334155);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: bgPrimaryLight,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: primaryHover,
        surface: bgSecondaryLight,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimaryLight,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSecondaryLight,
        foregroundColor: textPrimaryLight,
        elevation: 1,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgTertiaryLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: bgPrimaryDark,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: primaryHover,
        surface: bgSecondaryDark,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimaryDark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSecondaryDark,
        foregroundColor: textPrimaryDark,
        elevation: 1,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgTertiaryDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
      ),
    );
  }
}

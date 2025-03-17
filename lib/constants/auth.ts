/**
 * Authentication related constants
 */
export const AUTH_CONSTANTS = {
  /**
   * Session and token configuration
   */
  SESSION: {
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  /**
   * Error messages for authentication
   */
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: "メールアドレスまたはパスワードが無効です",
    MISSING_CREDENTIALS: "メールアドレスとパスワードは必須です",
    USER_NOT_FOUND: "ユーザーが見つかりません",
    SERVER_ERROR: "認証中にエラーが発生しました",
  },
} as const;

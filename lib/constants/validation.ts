/**
 * Validation related constants
 */
export const VALIDATION_CONSTANTS = {
  /**
   * Authentication validation rules
   */
  AUTH: {
    PASSWORD: {
      MIN_LENGTH: 8,
      PATTERN: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      REQUIREMENTS: [
        "8文字以上",
        "少なくとも1つの英字",
        "少なくとも1つの数字",
        "少なくとも1つの特殊文字",
      ],
    },
    EMAIL: {
      PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
  },

  /**
   * Report validation rules
   */
  REPORT: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100,
    },
    CONTENT: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 2000,
    },
  },

  /**
   * Comment validation rules
   */
  COMMENT: {
    CONTENT: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 500,
    },
  },
} as const;

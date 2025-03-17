/**
 * Report related constants
 */
export const REPORT_CONSTANTS = {
  /**
   * Error messages for report operations
   */
  ERROR_MESSAGES: {
    NOT_FOUND: "レポートが見つかりません",
    UNAUTHORIZED: "このレポートにアクセスする権限がありません",
    INVALID_STATUS: "無効なステータスです",
    DELETE_ERROR: "レポートの削除中にエラーが発生しました",
    UPDATE_ERROR: "レポートの更新中にエラーが発生しました",
    ACCESS_ERROR: "レポートの確認中にエラーが発生しました",
  },

  /**
   * Common database query selections
   */
  QUERY_SELECTIONS: {
    USER_SELECT_FIELDS: {
      name: true,
      email: true,
    },
  },

  /**
   * Pagination defaults
   */
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
} as const;

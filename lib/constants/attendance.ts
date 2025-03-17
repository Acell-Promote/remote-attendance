export const ATTENDANCE = {
  RECORDS_PER_PAGE: 5,
  CLOCK_ACTIONS: {
    IN: "clock-in",
    OUT: "clock-out",
  },
  UI_MESSAGES: {
    LOADING: "処理中...",
    CLOCK_IN: "出勤",
    CLOCK_OUT: "退勤",
    NO_RECORDS: "出勤記録がありません",
    CURRENT_STATUS: "現在の状態",
    CURRENT_TIME: "現在の日時",
    CURRENTLY_WORKING: "現在出勤中です",
    START_TIME: "開始時間",
    HISTORY_TITLE: "出勤履歴",
    LOADING_HISTORY: "読み込み中...",
  },
  TABLE_HEADERS: {
    DATE: "日付",
    CLOCK_IN: "出勤時間",
    CLOCK_OUT: "退勤時間",
    DURATION: "勤務時間",
    STATUS: "状態",
  },
  STATUS_LABELS: {
    COMPLETED: "完了",
    IN_PROGRESS: "進行中",
  },
} as const;

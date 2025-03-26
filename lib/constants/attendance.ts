export const ATTENDANCE = {
  RECORDS_PER_PAGE: 10,
  CLOCK_ACTIONS: {
    IN: "clock-in",
    OUT: "clock-out",
    DELETE: "delete",
  },
  UI_MESSAGES: {
    LOADING: "処理中...",
    CLOCK_IN: "出勤",
    CLOCK_OUT: "退勤",
    CURRENT_STATUS: "現在の状態",
    CURRENT_TIME: "現在の日時",
    CURRENTLY_WORKING: "現在出勤中です",
    START_TIME: "開始時間",
    HISTORY_TITLE: "勤怠履歴",
    LOADING_HISTORY: "履歴を読み込み中...",
    NO_RECORDS: "勤怠記録がありません",
  },
  TABLE_HEADERS: {
    CLOCK_IN: "出勤時間",
    CLOCK_OUT: "退勤時間",
    BREAK_TIME: "休憩時間",
    DURATION: "勤務時間",
    STATUS: "状態",
  },
  STATUS_LABELS: {
    COMPLETED: "完了",
    IN_PROGRESS: "進行中",
  },
} as const;

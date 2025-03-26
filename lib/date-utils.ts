export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return "N/A";
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(date);
}

export function formatDateTimeLocal(date: Date): string {
  // Convert to JST for display
  const jstDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getDate()).padStart(2, "0");
  const hours = String(jstDate.getHours()).padStart(2, "0");
  const minutes = String(jstDate.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function calculateDuration(
  start: Date,
  end: Date | null = null,
  breakMinutes: number = 0,
): string {
  const endTime = end || new Date();
  const duration = Math.floor(
    (endTime.getTime() - start.getTime()) / 1000 / 60,
  );
  const adjustedDuration = duration - breakMinutes;
  const hours = Math.floor(adjustedDuration / 60);
  const minutes = adjustedDuration % 60;
  return `${hours}時間${minutes}分`;
}

/**
 * Formats a date to JST datetime-local string (YYYY-MM-DDTHH:mm)
 * Used for datetime-local input fields
 */
export function formatToJSTDateTimeLocal(date: Date | null): string | null {
  if (!date) return null;

  return date
    .toLocaleString("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+)/, "$3-$1-$2T$4:$5");
}

/**
 * Converts a JST date to UTC
 * @param jstDate - Date object representing a time in JST
 * @returns Date object in UTC
 */
export function convertJSTtoUTC(jstDate: Date | null): Date | null {
  if (!jstDate) return null;

  return new Date(
    jstDate.getTime() +
      jstDate.getTimezoneOffset() * 60 * 1000 +
      9 * 60 * 60 * 1000,
  );
}

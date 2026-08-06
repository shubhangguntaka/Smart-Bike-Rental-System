/**
 * Utility functions for 12-hour AM/PM formatting and time-based availability logic.
 */

/**
 * Converts 24-hour time string ("09:00", "13:30", "21:00") into 12-hour AM/PM format ("9:00 AM", "1:30 PM", "9:00 PM").
 */
export const format12Hour = (timeStr?: string): string => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].slice(0, 2).padStart(2, "0");

  if (isNaN(hour)) return timeStr;

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${period}`;
};

/**
 * Parses a 12-hour AM/PM string (e.g., "9:00 AM", "11:30 PM") into a 24-hour string ("09:00", "23:30").
 */
export const parse12HourTo24 = (formatted12h: string): string => {
  if (!formatted12h) return "09:00";
  const match = formatted12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return formatted12h;

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
};

/**
 * Checks if the bike is within its operational time window right now based on system time.
 * e.g., If operational time is 09:00 to 11:00, and current time is 09:57, returns true.
 * If current time is 11:05, returns false (time window expired).
 */
export const isBikeAvailableNow = (
  availableStartTime?: string,
  availableEndTime?: string
): boolean => {
  if (!availableStartTime && !availableEndTime) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMinutes = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const startMinutes = parseMinutes(availableStartTime) ?? 0;
  const endMinutes = parseMinutes(availableEndTime) ?? 1439;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight window (e.g., 9:00 PM to 5:00 AM)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

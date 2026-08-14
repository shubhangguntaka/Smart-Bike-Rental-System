/**
 * Utility functions for 12-hour AM/PM formatting and time-based availability logic.
 */

/**
 * Converts 24-hour time string ("09:00", "13:30", "21:00") into 12-hour AM/PM format ("9:00 AM", "1:30 PM", "9:00 PM").
 */
export const format12Hour = (timeStr?: string): string => {
  if (!timeStr) return "";
  const str = timeStr.trim().toUpperCase();

  // If already formatted as 12-hour AM/PM string
  if (str.includes("AM") || str.includes("PM")) return str;

  const parts = str.split(":");
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
  const str = formatted12h.trim().toUpperCase();
  const isPM = str.includes("PM");
  const isAM = str.includes("AM");

  const parts = str.replace(/(AM|PM)/g, "").trim().split(":");
  if (parts.length < 2) return formatted12h;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].slice(0, 2).padStart(2, "0");
  if (isNaN(hour)) return formatted12h;

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
};

/**
 * Parses any time string ("12:00 PM", "09:00", "19:00:00") into minutes since midnight (0..1439).
 */
export const parseMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const str = timeStr.trim().toUpperCase();

  const isPM = str.includes("PM");
  const isAM = str.includes("AM");

  const cleanStr = str.replace(/(AM|PM)/g, "").trim();
  const parts = cleanStr.split(":");
  if (parts.length < 2) return null;

  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
};

export type ShiftState = "AVAILABLE" | "YET_TO_START" | "SHIFT_CLOSED" | "BOOKED" | "MAINTENANCE";

/**
 * Evaluates the precise shift state based on start/end times and current clock time.
 */
export const getShiftState = (
  availableStartTime?: string,
  availableEndTime?: string,
  bikeStatus?: string,
  availableDate?: string | Date
): ShiftState => {
  const statusUpper = (bikeStatus || "AVAILABLE").toUpperCase().replace(/\s+/g, "_");
  if (statusUpper === "BOOKED") return "BOOKED";
  if (statusUpper === "UNDER_MAINTENANCE" || statusUpper === "MAINTENANCE") return "MAINTENANCE";

  // If an explicit availableDate is provided, compare with today
  try {
    if (availableDate) {
      const today = new Date();
      const ad = typeof availableDate === "string" ? new Date(availableDate) : availableDate;
      // Normalize to date-only for comparison
      const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split("T")[0];
      const adStr = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate()).toISOString().split("T")[0];
      if (adStr > todayStr) return "YET_TO_START";
      if (adStr < todayStr) return "SHIFT_CLOSED";
    }
  } catch (e) {
    // ignore parse errors and continue
  }

  if (!availableStartTime || !availableEndTime) return "AVAILABLE";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = parseMinutes(availableStartTime);
  const endMinutes = parseMinutes(availableEndTime);

  if (startMinutes === null || endMinutes === null) return "AVAILABLE";

  if (startMinutes <= endMinutes) {
    if (currentMinutes < startMinutes) return "YET_TO_START";
    if (currentMinutes > endMinutes) return "SHIFT_CLOSED";
    return "AVAILABLE";
  } else {
    // Overnight window (e.g., 9:00 PM to 5:00 AM)
    if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
      return "AVAILABLE";
    }
    return "SHIFT_CLOSED";
  }
};

/**
 * Checks if the bike is within its operational time window right now based on system time.
 */
export const isBikeAvailableNow = (
  availableStartTime?: string,
  availableEndTime?: string,
  availableDate?: string | Date
): boolean => {
  return getShiftState(availableStartTime, availableEndTime, undefined, availableDate) === "AVAILABLE";
};

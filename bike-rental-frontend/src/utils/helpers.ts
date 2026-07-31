/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (text: string): string => {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalizes every word.
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return "";

  return text
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
};

/**
 * Formats currency.
 */
export const formatCurrency = (
  amount: number,
  currency: string = "INR"
): string => {

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats date.
 */
export const formatDate = (
  date: string | Date,
  locale: string = "en-IN"
): string => {

  return new Date(date).toLocaleDateString(locale);
};

/**
 * Formats date & time.
 */
export const formatDateTime = (
  date: string | Date,
  locale: string = "en-IN"
): string => {

  return new Date(date).toLocaleString(locale);
};

/**
 * Generates a random color.
 */
export const getRandomColor = (): string => {

  const colors = [
    "#0d6efd",
    "#198754",
    "#ffc107",
    "#dc3545",
    "#7e3ee6",
    "#20c997",
    "#fd7e14",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Truncates long text.
 */
export const truncateText = (
  text: string,
  maxLength: number
): string => {

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
};

/**
 * Generates initials from a full name.
 */
export const getInitials = (name: string): string => {

  if (!name) return "";

  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();
};

/**
 * Converts bytes to MB.
 */
export const bytesToMB = (bytes: number): number => {

  return Number((bytes / (1024 * 1024)).toFixed(2));
};

/**
 * Delays execution.
 */
export const sleep = (ms: number): Promise<void> => {

  return new Promise(resolve => setTimeout(resolve, ms));
};
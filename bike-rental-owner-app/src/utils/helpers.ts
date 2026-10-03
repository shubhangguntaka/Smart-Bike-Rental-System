export function getInitials(name?: string): string {
  if (!name) return "OW";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function truncate(text?: string, length: number = 30): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

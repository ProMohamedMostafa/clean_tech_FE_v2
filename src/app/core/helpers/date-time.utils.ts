// =======================================================
// Date & Time Utilities
// =======================================================

/**
 * Convert UTC datetime string (without timezone) into local string.
 * Example: "2025-09-17T10:35:29.9386432" → "9/17/25, 1:35 PM"
 */
export function parseUtcToLocal(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr + 'Z').toLocaleString();
}

/**
 * Format backend duration (HH:mm:ss.SSSSSSS) into human-friendly string.
 * Example: "00:06:12.5620048" → "6m 12s"
 */
export function formatDuration(duration: string | null): string | null {
  if (!duration) return null;

  const parts = duration.split(':');
  if (parts.length < 3) return duration;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = Math.floor(parseFloat(parts[2])); // strip milliseconds

  const result: string[] = [];
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0) result.push(`${seconds}s`);

  return result.length > 0 ? result.join(' ') : '0s';
}

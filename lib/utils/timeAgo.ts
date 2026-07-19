// Turns a date into a short label like "5s", "3m", "2h", "4d", "1w".
export function timeAgo(date: string) {
  // Supabase can return a timestamp with no timezone marker (e.g.
  // "2026-07-19T12:00:00") that actually holds UTC time. JS would parse that as
  // *local* time and shift it by the device's offset (8h in UTC+8), making a
  // fresh post look hours old. If there's no timezone info, treat it as UTC.
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(date);
  const normalized = hasTimezone ? date : date.replace(" ", "T") + "Z";

  // diff between current and given time in secs (never negative)
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(normalized).getTime()) / 1000),
  );

  // less than a minute
  if (seconds < 60) {
    return `${seconds}s`;
  }
  // less than an hour
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  // within a day
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  }
  // within a week
  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d`;
  }
  // more than a week
  return `${Math.floor(seconds / 604800)}w`;
}

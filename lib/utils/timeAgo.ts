// Turns a date into a short label like "5s", "3m", "2h", "4d", "1w".
export function timeAgo(date: string) {
  // diff between current and given time in secs
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
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

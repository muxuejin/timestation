export default function monotonicTime(offset?: number) {
  return performance.timeOrigin + performance.now() + (offset ?? 0);
}

export function isEuropeanSummerTime(utcTimestamp: number) {
  /*
   * BST/CEST are in effect from 01:00 UTC on the last Sunday
   * of March to 01:00 UTC on the last Sunday of October.
   */
  const date = new Date(utcTimestamp);
  const month = date.getUTCMonth();

  if (month < 2 || month > 9) return false;
  if (month > 2 && month < 9) return true;

  const dayOfMonth = date.getUTCDate();
  const dayOfWeek = date.getUTCDay();
  const thisWeekSunday = dayOfMonth - dayOfWeek;
  const weeksLeftInMonth = Math.trunc((31 - thisWeekSunday) / 7);
  const lastSundayOfMonth = thisWeekSunday + 7 * weeksLeftInMonth;

  return dayOfMonth === lastSundayOfMonth ?
      (month === 2) !== date.getUTCHours() < 1
    : (month === 2) !== dayOfMonth < lastSundayOfMonth;
}

export function formatTimeZoneOffset(offset: number) {
  const minsOffset = Math.trunc(offset / (60 * 1000));
  const sign = minsOffset < 0 ? "-" : "+";
  const absOffset = Math.abs(minsOffset);
  const hh = `${Math.trunc(absOffset / 60)}`.padStart(2, "0");
  const mm = `${absOffset % 60}`.padStart(2, "0");
  return `${sign}${hh}${mm}`;
}

export function decomposeOffset(offset: number) {
  const intOffset = Math.trunc(offset);
  const absOffset = Math.abs(intOffset);

  const negative = intOffset < 0;
  const hh = Math.trunc(absOffset / (60 * 60 * 1000));
  const mm = Math.trunc(absOffset / (60 * 1000)) % 60;
  const ss = Math.trunc(absOffset / 1000) % 60;
  const ms = absOffset % 1000;

  return { negative, hh, mm, ss, ms };
}

const kMinus = "\u{2212}" as const;

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
  const absOffset = Math.abs(offset);
  const ms = absOffset % 1000;
  const ss = Math.trunc(absOffset / 1000) % 60;
  const mm = Math.trunc(absOffset / (60 * 1000)) % 60;
  const hh = Math.trunc(absOffset / (60 * 60 * 1000));

  let tzOffset = offset < 0 ? kMinus : "+";
  tzOffset += `${hh.toString().padStart(2, "0")}:`;
  tzOffset += `${mm.toString().padStart(2, "0")}`;
  if (ss !== 0 || ms !== 0) tzOffset += `:${ss.toString().padStart(2, "0")}`;
  if (ms !== 0) tzOffset += `.${ms.toString().padStart(3, "0")}`;

  return tzOffset;
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

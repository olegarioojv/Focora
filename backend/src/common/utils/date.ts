// App's target audience is Brazil — computing "today"/day boundaries in
// raw UTC shifts every evening study session (~21h-23h59 local) onto the
// next UTC day, silently breaking the streak and the 100-day calendar for
// anyone studying at night.
export const APP_TIMEZONE = 'America/Sao_Paulo';

export function dateStringInTimezone(date: Date) {
  // en-CA formats as yyyy-mm-dd, which is what the rest of the app expects.
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(
    date,
  );
}

export function todayDateString() {
  return dateStringInTimezone(new Date());
}

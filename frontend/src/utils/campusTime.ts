export const campusTimeZone = "Asia/Jakarta";
export const campusUtcOffset = "+07:00";

const campusDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  timeZone: campusTimeZone,
  year: "numeric",
});

const campusTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: campusTimeZone,
});

const campusDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: campusTimeZone,
  year: "numeric",
});

export function formatCampusDate(value: string | Date) {
  return campusDateFormatter.format(new Date(value));
}

export function formatCampusTime(value: string | Date) {
  return campusTimeFormatter.format(new Date(value));
}

export function campusDateKey(value: string | Date) {
  return campusDateKeyFormatter.format(new Date(value));
}

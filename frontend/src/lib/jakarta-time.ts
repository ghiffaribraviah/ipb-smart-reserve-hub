const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: JAKARTA_TIME_ZONE,
});

const jakartaTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: JAKARTA_TIME_ZONE,
});

export function isValidIsoDateTime(value: string | null): value is string {
  if (!value) return false;
  return !Number.isNaN(Date.parse(value));
}

export function formatJakartaDate(value: string): string {
  return jakartaDateFormatter.format(new Date(value));
}

export function formatJakartaTime(value: string): string {
  return jakartaTimeFormatter.format(new Date(value)).replace(".", ":");
}

export function formatJakartaWindow(startsAt: string, endsAt: string): string {
  return `${formatJakartaDate(startsAt)}, ${formatJakartaTime(startsAt)}-${formatJakartaTime(endsAt)} WIB`;
}

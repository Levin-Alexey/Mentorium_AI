const MOSCOW_TIMEZONE = "Europe/Moscow";
const INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/;

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function formatDateTime(dateString) {
  if (!dateString) {
    return { date: "", time: "" };
  }

  const inputMatch = dateString.match(INPUT_RE);
  if (inputMatch) {
    const [, year, month, day, hour, minute] = inputMatch;
    return {
      date: `${day}.${month}.${year}`,
      time: `${hour}:${minute}`,
    };
  }

  const normalized = dateString.includes("T")
    ? dateString
    : dateString.replace(" ", "T") + "Z";
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  const datePart = date.toLocaleDateString("ru-RU", {
    timeZone: MOSCOW_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("ru-RU", {
    timeZone: MOSCOW_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date: datePart, time: timePart };
}

export function toWebinarDateInput(value) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(INPUT_RE);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toSqlDateTime(date) {
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const hour = pad2(date.getUTCHours());
  const minute = pad2(date.getUTCMinutes());
  const second = pad2(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

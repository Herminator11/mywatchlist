import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Abschlussdatum mit Prefix: TV -> "finished: dd.MM.yyyy", Film -> "watched: ..."
export function formatFinishedDate(date: Date, mediaType: string): string {
  const prefix = mediaType === "tv" ? "finished: " : "watched: "
  return prefix + format(date, "dd.MM.yyyy")
}

// Prefix entfernen und das Datum (dd.MM.yyyy) als Date zurückgeben.
export function parseFinishedDate(raw?: string | null): Date | null {
  if (!raw) return null
  const cleaned = raw.replace("finished: ", "").replace("watched: ", "").trim()
  const m = cleaned.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

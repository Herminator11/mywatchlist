import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Anzeige-/Speicherformat für Datumsangaben.
export const DATE_FORMAT = "dd/MM/yyyy"

// Abschlussdatum mit Prefix: TV -> "finished: dd/MM/yyyy", Film -> "watched: ..."
export function formatFinishedDate(date: Date, mediaType: string): string {
  const prefix = mediaType === "tv" ? "finished: " : "watched: "
  return prefix + format(date, DATE_FORMAT)
}

// Prefix entfernen und das Datum als Date zurückgeben.
// Akzeptiert beide Trenner (".", "/", "-"), damit ältere Einträge (dd.MM.yyyy)
// weiterhin korrekt geparst werden.
export function parseFinishedDate(raw?: string | null): Date | null {
  if (!raw) return null
  const cleaned = raw.replace("finished: ", "").replace("watched: ", "").trim()
  const m = cleaned.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

// Abschlussdatum für die Anzeige: immer dd/MM/yyyy – auch für Altdaten mit Punkten.
export function displayFinishedDate(raw?: string | null): string | null {
  const d = parseFinishedDate(raw)
  if (d) return format(d, DATE_FORMAT)
  if (!raw) return null
  const cleaned = raw.replace("finished: ", "").replace("watched: ", "").trim()
  return cleaned || null
}

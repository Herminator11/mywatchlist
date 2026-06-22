# MyWatchlist – Komponentenbibliothek

> Diese Dokumentation beschreibt alle wiederverwendbaren UI-Komponenten des Projekts.
> Alle Komponenten befinden sich unter `src/components/` und bauen auf shadcn/ui auf.
> Vor der Entwicklung neuer Komponenten bitte prüfen ob eine bestehende Komponente erweitert werden kann.

---

## Inhaltsverzeichnis

1. [Design System](#design-system)
2. [Layout Komponenten](#layout-komponenten)
   - [PageHeader](#pageheader)
   - [Sidebar](#sidebar)
   - [MobileNav](#mobilenav)
3. [Karten Komponenten](#karten-komponenten)
   - [MediaCard](#mediacard)
   - [DraggableMediaCard](#draggablemediacard)
4. [Sheet Komponenten](#sheet-komponenten)
   - [AddSheet](#addsheet)
   - [EditSheet](#editsheet)
5. [Formular Komponenten](#formular-komponenten)
   - [SeasonPicker](#seasonpicker)
   - [DatePicker](#datepicker)
   - [TmdbSearchInput](#tmdbsearchinput)
6. [shadcn/ui Komponenten](#shadcnui-komponenten)

---

## Design System

Alle Komponenten verwenden CSS Custom Properties für Farben. **Niemals** hardcodierte Hex-Werte verwenden — immer die CSS Variablen nutzen.

### CSS Variablen

```css
--background: #1c1c1e        /* Seiten-Hintergrund */
--surface: #2c2c2e           /* Karten, Sidebar */
--surface-elevated: #3a3a3c  /* Sheets, Modals, Inputs */
--accent: #ffd60a            /* Gelb – Buttons, aktive Nav, PageHeader */
--text-primary: #ffffff
--text-secondary: rgba(235, 235, 245, 0.8)
--text-muted: rgba(235, 235, 245, 0.4)
--border: #38383a
--destructive: #ff453a       /* Fehler, Löschen */
```

### Verwendung in Komponenten

```tsx
// ✅ Korrekt
<div style={{ backgroundColor: "var(--surface)" }}>

// ✅ Auch korrekt (Tailwind arbitrary)
<div className="bg-[var(--surface)]">

// ❌ Falsch – niemals hardcoded
<div style={{ backgroundColor: "#2c2c2e" }}>
```

### Typografie

```tsx
// Überschrift
<h1 className="text-xl font-bold tracking-tight">

// Sekundärtext
<p style={{ color: "var(--text-secondary)" }} className="text-sm">

// Muted Text
<span style={{ color: "var(--text-muted)" }} className="text-xs">
```

---

## Layout Komponenten

### PageHeader

Gelber Balken mit Seitentitel – identisch zum Android-Design.

**Pfad:** `src/components/layout/PageHeader.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `title` | `string` | ✅ | Angezeigter Seitentitel |

**Verwendung:**

```tsx
import { PageHeader } from "@/components/layout/PageHeader";

// Auf jeder Seite als erstes Element
<PageHeader title="Want to Watch" />
<PageHeader title="Favoriten" />
<PageHeader title="Suche" />
```

**Hinweise:**
- Immer als erstes Element innerhalb des Seiten-Containers platzieren
- Kein `className` Override nötig — Styling ist fix
- Textfarbe ist immer schwarz (`#000`) auf gelbem Hintergrund

---

### Sidebar

Desktop-Navigation (versteckt auf Mobile). Zeigt aktiven Link mit gelbem Hintergrund.

**Pfad:** `src/components/layout/Sidebar.tsx`

**Props:** Keine — Navigation ist intern definiert.

**Verwendung:**

```tsx
// Wird automatisch im (app)/layout.tsx eingebunden
// Nicht manuell auf Seiten verwenden
import { Sidebar } from "@/components/layout/Sidebar";

<Sidebar />
```

**Nav-Einträge anpassen** (`src/components/layout/Sidebar.tsx`):

```tsx
const navItems = [
  { href: "/watchlist/want-to-watch", label: "Want to Watch", icon: "🎬" },
  // Neue Einträge hier hinzufügen
];
```

**Hinweise:**
- Nur ab `md` Breakpoint sichtbar (`hidden md:flex`)
- Aktiver Link wird automatisch über `usePathname()` erkannt

---

### MobileNav

Bottom-Navigation für Mobile (versteckt auf Desktop).

**Pfad:** `src/components/layout/MobileNav.tsx`

**Props:** Keine

**Verwendung:**

```tsx
// Wird automatisch im (app)/layout.tsx eingebunden
import { MobileNav } from "@/components/layout/MobileNav";

<MobileNav />
```

**Hinweise:**
- Nur auf `md` und kleiner sichtbar
- Maximal 5 Einträge — sonst wird es zu eng auf kleinen Screens
- `pb-24` im Main-Container nicht vergessen damit Content nicht hinter Nav verschwindet

---

## Karten Komponenten

### MediaCard

Universelle Karte für Filme und Serien. Zeigt Poster, Titel, Datum und Aktions-Buttons.

**Pfad:** `src/components/cards/MediaCard.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `movie` | `MovieEntry` | ✅ | Film/Serien-Objekt aus der DB |
| `onEdit` | `(movie: MovieEntry) => void` | ✅ | Callback beim Klick auf Bearbeiten |
| `onDelete` | `(movie: MovieEntry) => void` | ✅ | Callback beim Klick auf Löschen |
| `onMove` | `(movie: MovieEntry, action: MoveAction) => void` | ❌ | Callback für Listen-Verschiebung |
| `showMoveButton` | `boolean` | ❌ | Zeigt "Verschieben"-Button (default: `false`) |
| `showFavoriteButton` | `boolean` | ❌ | Zeigt Favoriten-Stern (default: `false`) |

**Typen:**

```tsx
type MoveAction = "to_watching" | "to_watched";

interface MovieEntry {
  tmdbId: number;
  listType: string;
  seasonNumber: string;
  title: string;
  releaseDate: string;
  posterPath: string | null;
  mediaType: "tv" | "movie";
  finishedDate: string | null;
  favoriteCategory: string | null;
  isFavorite: boolean;
  notes: string | null;
  sortOrder: number;
}
```

**Verwendung:**

```tsx
import { MediaCard } from "@/components/cards/MediaCard";

// Basis
<MediaCard
  movie={movie}
  onEdit={(m) => setEditTarget(m)}
  onDelete={(m) => handleDelete(m)}
/>

// Mit Move-Button (Want to Watch Liste)
<MediaCard
  movie={movie}
  onEdit={(m) => setEditTarget(m)}
  onDelete={(m) => handleDelete(m)}
  onMove={(m, action) => handleMove(m, action)}
  showMoveButton={true}
/>

// Mit Favoriten-Button
<MediaCard
  movie={movie}
  onEdit={(m) => setEditTarget(m)}
  onDelete={(m) => handleDelete(m)}
  showFavoriteButton={true}
/>
```

**React Key:** Immer den Composite Key verwenden:

```tsx
// ✅ Korrekt
<MediaCard key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`} ... />

// ❌ Falsch
<MediaCard key={movie.tmdbId} ... />
```

---

### DraggableMediaCard

Wrapper um `MediaCard` mit Drag & Drop Support via `@dnd-kit`. Nur für Favoriten-Listen verwenden.

**Pfad:** `src/components/cards/DraggableMediaCard.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `movie` | `MovieEntry` | ✅ | Film/Serien-Objekt |
| `id` | `string` | ✅ | Eindeutige ID für dnd-kit |
| `onEdit` | `(movie: MovieEntry) => void` | ✅ | Edit Callback |
| `onDelete` | `(movie: MovieEntry) => void` | ✅ | Delete Callback |

**Verwendung:**

```tsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableMediaCard } from "@/components/cards/DraggableMediaCard";

<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext
    items={movies.map((m) => `${m.tmdbId}_${m.listType}_${m.seasonNumber}`)}
    strategy={verticalListSortingStrategy}
  >
    {movies.map((movie) => (
      <DraggableMediaCard
        key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
        id={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
        movie={movie}
        onEdit={setEditTarget}
        onDelete={handleDelete}
      />
    ))}
  </SortableContext>
</DndContext>
```

---

## Sheet Komponenten

Sheets sind shadcn/ui `<Sheet>` Komponenten die von der rechten Seite einschieben.

### AddSheet

Sheet zum Hinzufügen eines neuen Films/Serie zur Watchlist. Beinhaltet TMDb-Suche, Listen-Auswahl, Staffel-Picker und Datums-Picker.

**Pfad:** `src/components/sheets/AddSheet.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `open` | `boolean` | ✅ | Sheet geöffnet/geschlossen |
| `onOpenChange` | `(open: boolean) => void` | ✅ | Callback bei Zustandsänderung |
| `onSuccess` | `() => void` | ✅ | Callback nach erfolgreichem Hinzufügen |
| `defaultListType` | `WatchListType` | ❌ | Vorausgewählte Liste |

**Verwendung:**

```tsx
import { AddSheet } from "@/components/sheets/AddSheet";

const [addOpen, setAddOpen] = useState(false);

<button onClick={() => setAddOpen(true)}>
  + Hinzufügen
</button>

<AddSheet
  open={addOpen}
  onOpenChange={setAddOpen}
  onSuccess={() => {
    setAddOpen(false);
    refetch(); // Liste neu laden
  }}
  defaultListType="WANT_TO_WATCH"
/>
```

**Formularfelder:**
- TMDb Suche (Debounced, min. 2 Zeichen)
- Listen-Auswahl (gefiltert nach `mediaType`)
- Staffel-Nummer (nur bei TV + relevanten Listen)
- Abschlussdatum (nur bei `RECENTLY_WATCHED_*`)
- Kategorie (nur bei `FAVORITE_*`)
- Notizen (optional)

---

### EditSheet

Sheet zum Bearbeiten eines bestehenden Eintrags. Vorausgefüllt mit aktuellen Werten.

**Pfad:** `src/components/sheets/EditSheet.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `movie` | `MovieEntry \| null` | ✅ | Zu bearbeitender Eintrag (null = geschlossen) |
| `onClose` | `() => void` | ✅ | Callback beim Schließen |
| `onSuccess` | `() => void` | ✅ | Callback nach erfolgreichem Speichern |

**Verwendung:**

```tsx
import { EditSheet } from "@/components/sheets/EditSheet";

const [editTarget, setEditTarget] = useState<MovieEntry | null>(null);

<EditSheet
  movie={editTarget}
  onClose={() => setEditTarget(null)}
  onSuccess={() => {
    setEditTarget(null);
    refetch();
  }}
/>
```

**Hinweise:**
- Sheet öffnet sich automatisch wenn `movie !== null`
- `isFavorite`-Änderung wird auf **alle** Einträge der `tmdbId` angewendet
- Alte `listType` und `seasonNumber` werden intern als `oldListType` / `oldSeasonNumber` gespeichert

---

## Formular Komponenten

### SeasonPicker

Zahleneingabe für Staffelnummern. Nur für TV-Serien in relevanten Listen anzeigen.

**Pfad:** `src/components/common/SeasonPicker.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `value` | `string` | ✅ | Aktuelle Staffelnummer |
| `onChange` | `(value: string) => void` | ✅ | Callback bei Änderung |
| `disabled` | `boolean` | ❌ | Eingabe deaktiviert |

**Verwendung:**

```tsx
import { SeasonPicker } from "@/components/common/SeasonPicker";
import { showSeasonPicker } from "@/schemas/movie";

// Nur anzeigen wenn relevant
{showSeasonPicker(mediaType, selectedListType) && (
  <SeasonPicker
    value={seasonNumber}
    onChange={setSeasonNumber}
  />
)}
```

**Wann anzeigen** (`showSeasonPicker` Logik):
- `mediaType === "tv"` UND
- `listType` ist `CURRENTLY_WATCHING`, `RECENTLY_WATCHED_TV` oder `WANT_TO_WATCH`

---

### DatePicker

Datumsauswahl via shadcn Popover + Calendar. Gibt formatiertes Datum mit Prefix zurück.

**Pfad:** `src/components/common/DatePicker.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `value` | `string \| null` | ✅ | Aktueller Wert (`"finished: 01.06.2025"`) |
| `onChange` | `(value: string \| null) => void` | ✅ | Callback bei Änderung |
| `mediaType` | `"tv" \| "movie"` | ✅ | Bestimmt Prefix (`finished:` / `watched:`) |

**Verwendung:**

```tsx
import { DatePicker } from "@/components/common/DatePicker";

<DatePicker
  value={finishedDate}
  onChange={setFinishedDate}
  mediaType="tv"
/>
// Speichert z.B.: "finished: 15.06.2025"

<DatePicker
  value={finishedDate}
  onChange={setFinishedDate}
  mediaType="movie"
/>
// Speichert z.B.: "watched: 15.06.2025"
```

**Datumsformat:** `dd.MM.yyyy` (via `date-fns`)

**Prefix-Konvention:**
- TV-Serien: `"finished: "` 
- Filme: `"watched: "`

---

### TmdbSearchInput

Debounced Sucheingabe die gegen `/api/tmdb/search` sucht und Ergebnisse als Liste anzeigt.

**Pfad:** `src/components/search/TmdbSearchInput.tsx`

**Props:**

| Prop | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `onSelect` | `(movie: TmdbMovie) => void` | ✅ | Callback wenn Ergebnis ausgewählt |
| `placeholder` | `string` | ❌ | Input Placeholder (default: "Titel suchen...") |

**Typen:**

```tsx
interface TmdbMovie {
  id: number;
  title?: string;        // Filme
  name?: string;         // Serien
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  media_type: "tv" | "movie";
  overview: string;
}
```

**Verwendung:**

```tsx
import { TmdbSearchInput } from "@/components/search/TmdbSearchInput";

<TmdbSearchInput
  onSelect={(tmdbMovie) => {
    // Ausgewählten Film ins Formular übernehmen
    setSelectedMovie(tmdbMovie);
  }}
  placeholder="Film oder Serie suchen..."
/>
```

**Hinweise:**
- Debounce: 400ms
- Mindestlänge: 2 Zeichen
- Zeigt Poster-Thumbnail, Titel, Jahr und Typ (🎬 / 📺) in der Ergebnisliste
- Suchanfrage läuft serverseitig über `/api/tmdb/search` — TMDb API Key ist nie im Client

---

## shadcn/ui Komponenten

Folgende shadcn/ui Komponenten sind im Projekt installiert und können direkt verwendet werden:

| Komponente | Import | Verwendung |
|---|---|---|
| `Button` | `@/components/ui/button` | Alle Buttons |
| `Card` | `@/components/ui/card` | Karten-Container |
| `Sheet` | `@/components/ui/sheet` | Seitenleisten-Dialoge |
| `Input` | `@/components/ui/input` | Texteingaben |
| `Label` | `@/components/ui/label` | Formular-Labels |
| `Tabs` | `@/components/ui/tabs` | TV/Film Tabs auf Screens |
| `Badge` | `@/components/ui/badge` | Kategorie-Labels |
| `Dialog` | `@/components/ui/dialog` | Bestätigungs-Dialoge |
| `Popover` | `@/components/ui/popover` | DatePicker Container |
| `Calendar` | `@/components/ui/calendar` | Datumsauswahl |
| `Skeleton` | `@/components/ui/skeleton` | Loading States |
| `Sonner` | `@/components/ui/sonner` | Toast Notifications |

### Beispiele

```tsx
// Button
import { Button } from "@/components/ui/button";
<Button variant="default">Speichern</Button>
<Button variant="destructive">Löschen</Button>
<Button variant="outline">Abbrechen</Button>

// Tabs (TV / Film Aufteilung)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<Tabs defaultValue="tv">
  <TabsList>
    <TabsTrigger value="tv">Serien</TabsTrigger>
    <TabsTrigger value="movie">Filme</TabsTrigger>
  </TabsList>
  <TabsContent value="tv">...</TabsContent>
  <TabsContent value="movie">...</TabsContent>
</Tabs>

// Toast
import { toast } from "sonner";
toast.success("Film hinzugefügt!");
toast.error("Fehler beim Speichern.");

// Skeleton Loading
import { Skeleton } from "@/components/ui/skeleton";
<Skeleton className="h-24 w-full rounded-xl" />
```

---

## Konventionen

### Dateinamen
- Komponenten: `PascalCase.tsx` (z.B. `MediaCard.tsx`)
- Hooks: `camelCase.ts` mit `use`-Prefix (z.B. `useMovies.ts`)
- Utilities: `camelCase.ts` (z.B. `utils.ts`)

### Ordnerstruktur
```
src/components/
├── ui/          # shadcn/ui (nicht manuell bearbeiten)
├── layout/      # Sidebar, MobileNav, PageHeader
├── cards/       # MediaCard, DraggableMediaCard
├── sheets/      # AddSheet, EditSheet
├── search/      # TmdbSearchInput
└── common/      # SeasonPicker, DatePicker
```

### Client vs Server Komponenten
- Interaktive Komponenten (`useState`, `useEffect`, Event Handler): `"use client"` am Anfang
- Reine Darstellungs-Komponenten ohne State: Server Component (kein Directive nötig)
- Alle Komponenten in `src/components/` sind Client Components

### Props Naming
- Callbacks immer mit `on`-Prefix: `onEdit`, `onDelete`, `onSuccess`, `onClose`
- Boolean Props mit `is`/`show`-Prefix: `isFavorite`, `showMoveButton`
- Handler-Funktionen mit `handle`-Prefix: `handleDelete`, `handleSubmit`

### Fehlerbehandlung
```tsx
// Toast für User-Feedback
import { toast } from "sonner";

try {
  await fetch("/api/movies", { method: "POST", body: JSON.stringify(data) });
  toast.success("Erfolgreich gespeichert!");
} catch {
  toast.error("Etwas ist schiefgelaufen.");
}
```

# HANDOFF — MyWatchlist

Kurze Übergabe für neue Sitzungen. Der Code in `main` ist die Quelle der Wahrheit;
hier steht nur, was **nicht** offensichtlich aus dem Code hervorgeht.

## Stand
Alle Screens fertig, auf dem **Kino-Editorial-Designfundament** (Fraunces + Hanken Grotesk,
warmes Papier-Schwarz, Marigold-Akzent, Grain/Atmosphäre, CSS-`rise`-Reveals):
- Want to Watch, Currently Watching, Recently Watched, Favoriten, Suche, Trends, Einstellungen
- Auth: Benutzername + Passwort (keine E-Mail), Self-Service-Signup, Auto-Login
- Flows: Add (AddSheet / AddToListSheet), Move (want→watching→watched, setzt Abschlussdatum),
  Edit (EditSheet), Favoriten-Drag&Drop, Trends mit TMDb-Community-Score (nur dort), History-Export (.txt)

## Offene Roadmap (priorisiert)
1. (erledigt) Sidebar sticky
2. (erledigt) Datumsformat `dd/MM/yyyy`
3. **SeasonPicker (#4 + #5) — als Nächstes.** Ersetzt die 3-fach duplizierten Staffel-Inputs
   (AddSheet, AddToListSheet, EditSheet). Zähler geklemmt auf reale Staffelzahl → neuer
   TMDb-Details-Call `/tv/{id}` (`number_of_seasons`, gibt's noch nicht). Plus Toggle zu
   Freitextfeld ("Staffel 1 & Staffel 2"); im Freitext-Modus Zähler ignorieren. `seasonNumber`
   ist im Schema schon ein freier String.
4. **Caching (Performance) — zuletzt, vorab scopen.** `/api/movies` trifft bei jedem
   `useMovies`-Mount frisch Neon. Optionen: Client-Cache (SWR/React Query) vs. HTTP-Header vs.
   Next Data Cache. Wichtig: Invalidierung nach add/delete/move/edit. Reine Performance, keine Korrektheit.

## Nicht-offensichtliche Konventionen / Gotchas
- **Next.js 16**: „Middleware" heißt **Proxy**, liegt in `src/proxy.ts` (nicht Root). Matcher
  schließt `/api` aus (API-Routen antworten selbst mit 401).
- **Prisma 7**: kein `url` im `schema.prisma`; Adapter `@prisma/adapter-pg`; `prisma.config.ts`
  hat `datasource.url` + `migrations`. Build: `prisma generate && next build`.
- **Datum**: `formatFinishedDate` → `dd/MM/yyyy`; `parseFinishedDate` akzeptiert `.` `/` `-`
  (Altdaten ok); `displayFinishedDate` für Anzeige. Gespeichert als `"finished: …"` (TV) / `"watched: …"` (Film).
- **Composite Key** `(tmdbId, listType, seasonNumber)`. React-Keys immer
  `` `${tmdbId}_${listType}_${seasonNumber}` ``. seasonNumber für Favoriten/Filme = `""`.
- **isFavorite-Toggle bewusst weggelassen** — Favoriten sind eigene Listen (`FAVORITE_*`).
- **next/font**: Fraunces + Hanken Grotesk in `src/app/layout.tsx` (`--font-display`, `--font-sans`).
  Bewusst kein Inter (siehe `CLAUDE.md`-Ästhetik-Prompt). Icons: `lucide-react`.

## Arbeitsweise
1. `git checkout main && git fetch --prune && git pull --ff-only`, gemergte lokale Branches löschen
2. neue `feature/...`-Branch
3. bauen → `tsc --noEmit`, `eslint src`, `npm run build` (alle grün)
4. **E2E gegen Neon**: Test-User via `node scripts/create-user.mjs <name> <pw>`, CSRF-Login-Cookie,
   API durchspielen, **Test-User danach wieder löschen**
5. **Commit/Push/PR macht der User selbst** — Agent committet/pusht nicht ungefragt

## Wichtig
- **Echter Account `Herbie`** in Neon (0 Movies) — beim Cleanup **niemals löschen**.
- `.env.local` = echte Secrets; auf Vercel dieselben Env-Vars setzen (TMDb braucht `TMDB_API_KEY`).
- Harmlose Lint-Warnung: ungenutztes `z` in `src/lib/validate.ts`.
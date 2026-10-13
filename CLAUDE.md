# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser clone of Apple Notes (macOS Sonoma/Sequoia; iOS layout below 768px wide), built with Next.js 14.1, Redux Toolkit and Tailwind. The UI is in Chinese. The plan is in `docs/PLAN.md`.

## Commands

```bash
npm run dev        # http://localhost:3000
npm test           # vitest unit tests (src/**/__tests__)
npm run test:e2e   # Playwright, against the production build (run `npm run build` first)
npm run typecheck
npm run lint
npm run build
```

## Architecture

All app code lives in `src/`. `app/page.tsx` loads `src/components/NotesApp.tsx` with `ssr: false`, because state comes from IndexedDB.

- `src/lib/` — pure logic, no React:
  - `types.ts` — `Note`, `Folder`, `Selection`, UI enums
  - `note.ts` — derives `title` / `snippet` / `tags` from note HTML (first line = title)
  - `dates.ts` — list date formatting and date-group sections
  - `editorCommands.ts` — contentEditable formatting commands (execCommand + DOM edits); each starts with an undo checkpoint
  - `editorHistory.ts` — the editor's own undo/redo (HTML + caret snapshots); replaces the browser's
  - `highlights.ts` — #tag and search highlighting via the CSS Custom Highlight API (no DOM changes)
  - `images.ts` — image storage helpers for the browser (save, blob: URLs, strip `src` before saving)
  - `seed.ts` — sample data for first launch
- `src/store/` — Redux Toolkit:
  - `notesSlice` (notes; deletion sets `deletedAt` = Recently Deleted), `foldersSlice`, `uiSlice` (selection, search, view, widths, focus, mobile pane)
  - `actions.ts` — thunks that coordinate slices (new note, delete with neighbor selection, delete folder, restore); structural ones are wrapped in `undoable`
  - `history.ts` / `historySlice.ts` — app-level undo/redo: records the inverse patch of each undoable action
  - `selectors.ts` — memoized selectors (visible notes, sections, folder tree, counts, tags)
  - `db.ts` — IndexedDB (`applenotes`): one record per note, folder and image
  - `persistence.ts` — loads state (migrating the old `applenotes:v2` localStorage format), saves only changed records (throttled), view prefs in localStorage `applenotes:ui`
  - `boot.ts` — startup: load, persist, cross-tab sync over BroadcastChannel (`sync.ts` action), unused-image cleanup
- `src/components/` — `NotesApp` (provider, layouts, shortcuts), `Sidebar`, `NoteList`, `SwipeRow` (iPhone swipe actions), `Editor`, `Menu` (context/drop-down menus, keyboard-operable), `Dialog` (alerts, toasts), `menus.ts` (menu item builders)

## Conventions

- Note HTML is the source of truth; never store title separately from what `deriveFields` produces.
- Images are referenced as `<img data-image-id="…">`; never save a `src` (they are per-session blob: URLs). Save editor HTML via `serializeEditor`.
- New note/folder operations that users would expect ⌘Z to undo go through `undoable(label, thunk)`.
- Editor DOM changes made outside execCommand must call `checkpoint()` (via the command helpers) before and `emitChange()` after, or undo will merge them with typing.
- The editor saves after a 250 ms pause; call `flushEditor()` before anything that must see the latest text.
- Colors are CSS variables in `app/globals.css` (light/dark via `prefers-color-scheme`), exposed to Tailwind as `n-*` (e.g. `bg-n-sidebar`, `text-n-label2`). Don't hardcode grays.
- Typed hooks: `useAppDispatch`, `useAppSelector`, `useAppStore` from `src/store/hooks.ts`.
- Import with the `@/src/...` alias.

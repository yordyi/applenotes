# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser clone of Apple Notes (macOS Sonoma/Sequoia; iOS layout below 768px wide), built with Next.js 14.1, Redux Toolkit and Tailwind. The UI is in Chinese. The plan is in `docs/PLAN.md`.

## Commands

```bash
npm run dev        # http://localhost:3000
npm test           # vitest unit tests (src/**/__tests__)
npm run typecheck
npm run lint
npm run build
```

## Architecture

All app code lives in `src/`. `app/page.tsx` loads `src/components/NotesApp.tsx` with `ssr: false`, because state comes from localStorage.

- `src/lib/` — pure logic, no React:
  - `types.ts` — `Note`, `Folder`, `Selection`, UI enums
  - `note.ts` — derives `title` / `snippet` / `tags` from note HTML (first line = title)
  - `dates.ts` — list date formatting and date-group sections
  - `editorCommands.ts` — contentEditable formatting commands (execCommand + DOM edits)
  - `seed.ts` — sample data for first launch
- `src/store/` — Redux Toolkit:
  - `notesSlice` (notes; deletion sets `deletedAt` = Recently Deleted), `foldersSlice`, `uiSlice` (selection, search, view, widths, focus, mobile pane)
  - `actions.ts` — thunks that coordinate slices (new note, delete with neighbor selection, delete folder, restore)
  - `selectors.ts` — memoized selectors (visible notes, sections, folder tree, counts, tags)
  - `persistence.ts` — load/save to localStorage (`applenotes:v2`), throttled
- `src/components/` — `NotesApp` (provider, layouts, shortcuts), `Sidebar`, `NoteList`, `Editor`, `Menu` (context/drop-down menus), `Dialog` (alerts, toasts), `menus.ts` (menu item builders)

## Conventions

- Note HTML is the source of truth; never store title separately from what `deriveFields` produces.
- Colors are CSS variables in `app/globals.css` (light/dark via `prefers-color-scheme`), exposed to Tailwind as `n-*` (e.g. `bg-n-sidebar`, `text-n-label2`). Don't hardcode grays.
- Typed hooks: `useAppDispatch`, `useAppSelector`, `useAppStore` from `src/store/hooks.ts`.
- Import with the `@/src/...` alias.

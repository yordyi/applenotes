# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Apple Notes clone web application built with Next.js 14.1.0 and Redux Toolkit. The app mimics Apple Notes' interface and functionality, featuring note creation/editing, folder organization, search, and pinning capabilities.

## Essential Commands

```bash
npm run dev    # Start development server on http://localhost:3000
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Architecture

### State Management
The application uses Redux Toolkit with three main slices:

1. **notesSlice** (`store/slices/notesSlice.ts`): Manages all note operations
   - State: `notes[]`, `selectedNoteId`, `searchQuery`
   - Actions: `addNote`, `updateNote`, `deleteNote`, `selectNote`, `setSearchQuery`, `togglePinNote`

2. **foldersSlice** (`store/slices/foldersSlice.ts`): Manages folder hierarchy
   - State: `folders[]`, `selectedFolderId`
   - Actions: `addFolder`, `updateFolder`, `deleteFolder`, `selectFolder`

3. **uiSlice** (`store/slices/uiSlice.ts`): Controls UI preferences
   - State: `sidebarCollapsed`, `view` (grid/list), `sortBy`, `showPinnedOnly`
   - Actions: `toggleSidebar`, `setView`, `setSortBy`, `toggleShowPinnedOnly`

### Component Architecture
All components use client-side rendering (`'use client'`). The main layout consists of:

- **Sidebar** → **NotesList** → **NoteEditor** (when note selected)
- **Toolbar** provides view controls above NotesList

Data flow: Redux store → typed hooks (`useAppSelector`/`useAppDispatch`) → Components

### Key Design Patterns
1. **Typed Redux Hooks**: Custom hooks in `store/hooks.ts` provide TypeScript integration
2. **Optimistic Updates**: Note changes update immediately in state before any persistence
3. **Controlled Components**: All form inputs are controlled via Redux state
4. **Responsive Layout**: Sidebar is fixed width (w-72), NotesList adapts, NoteEditor appears when note selected

## Development Notes

### Adding New Features
- New Redux state goes in appropriate slice or create new slice in `store/slices/`
- Update `store/store.ts` to include new reducers
- Components should use `useAppSelector` and `useAppDispatch` hooks
- Follow existing component patterns (client-side, typed props, Redux integration)

### Styling Guidelines
- Use Tailwind classes with custom Apple-themed colors defined in `tailwind.config.js`
- Apple gray scale: `apple-gray-{50-900}`
- Apple yellow accent: `apple-yellow`
- Dark mode supported via Tailwind's `dark:` prefix

### Data Models
```typescript
Note: {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  isPinned: boolean
  tags: string[]
}

Folder: {
  id: string
  name: string
  icon?: string
  parentId: string | null
  createdAt: string
}
```

### Chinese Localization
The UI uses Chinese text for labels. Key terms:
- 备忘录 (Notes)
- 搜索 (Search)
- 置顶备忘录 (Pinned Notes)
- 新建备忘录 (New Note)
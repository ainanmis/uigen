# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + Prisma generate + migrate
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run test         # Run Vitest tests
npm run lint         # ESLint
npm run db:reset     # Reset SQLite database (destructive)
```

Run a single test file:
```bash
npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts
```

## Environment

Requires `.env` at root with:
```
ANTHROPIC_API_KEY=...   # Optional — falls back to MockLanguageModel without it
JWT_SECRET=...
```

## Architecture

UIGen is an AI-powered React component generator. Users describe components in chat; Claude generates code via tool calls into a virtual file system, which is transpiled in-browser and rendered in an iFrame.

### Data Flow

```
Chat Input → /api/chat (Next.js route)
           → Claude via Vercel AI SDK (streamText)
           → Tool calls: str_replace_editor / file_manager
           → VirtualFileSystem (in-memory Map)
           → FileSystemContext (React state)
           → JSX Transformer (Babel standalone)
           → Import map + blob URLs
           → PreviewFrame (iFrame)
```

### Key Modules

**`src/lib/file-system.ts`** — In-memory virtual file system. All generated code lives here. Claude manipulates it via tool calls; the UI reads from it.

**`src/lib/contexts/`** — Two React contexts:
- `FileSystemContext`: wraps VirtualFileSystem, handles tool-call execution, tracks active file
- `ChatContext`: wraps Vercel AI SDK's `useChat`, manages messages and streaming state

**`src/lib/tools/`** — Tool definitions given to Claude:
- `str_replace_editor`: view/create/str_replace/insert operations on virtual files
- `file_manager`: rename/delete files and directories

**`src/lib/prompts/generation.tsx`** — System prompt. Instructs Claude to use Tailwind, keep `/App.jsx` as the entry point, and use `@/` for local imports.

**`src/lib/transform/jsx-transformer.ts`** — Babel-based in-browser transpiler. Converts JSX/TSX to ES modules, creates blob URLs, builds an import map for esm.sh CDN, and injects CSS.

**`src/lib/provider.ts`** — Returns Anthropic `claude-haiku-4-5` or `MockLanguageModel` (generates a sample component when no API key is set).

**`src/app/api/chat/route.ts`** — Streams Claude responses; persists project to DB on completion.

**`src/actions/`** — Server actions for auth (sign up/in/out, JWT cookies) and project CRUD.

### Layout

```
┌─────────────────────┬────────────────────────┐
│   Chat Panel (35%)  │   Preview/Code (65%)   │
│                     ├────────────────────────┤
│                     │ Preview iFrame         │
│                     │ OR Code view:          │
│                     │  FileTree (30%) + Monaco (70%) │
└─────────────────────┴────────────────────────┘
```

### Database

SQLite via Prisma (`prisma/dev.db`). Schema: `User` → `Project[]` with a `data` JSON field that stores the serialized virtual file system and messages. Anonymous users' work is tracked in `localStorage` via `src/lib/anon-work-tracker.ts`.

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

### AI Entry Point Convention

Claude is instructed to always use `/App.jsx` as the component entry point, with local imports using the `@/` alias.

## Code Style

Use comments sparingly. Only comment complex or non-obvious code.

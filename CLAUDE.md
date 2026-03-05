# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo contains two versions of an interactive insurance signup form editor with a chat-based command interface:

- **`app-v1-only-html-js-manipulation/`** — Vanilla HTML/CSS/JS, no build step, single `signup.html` file
- **`app-v2-react-state-management/`** — React 19 + TypeScript + Vite (the primary version)

## Commands (app-v2)

All commands run from `app-v2-react-state-management/`:

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (http://localhost:5173, HMR enabled)
npm run build      # TypeScript compile + Vite bundle → dist/
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Architecture (app-v2)

**Single-component design:** `src/App.tsx` contains all state, logic, and JSX — no component decomposition.

**State:** All managed via `useState` hooks at the App level:
- Page-level: `title`, `tagline`, `heading`, `btnText`, `btnColor`, `bgColor`
- Field-level: `fieldLabels`, `fieldPlaceholders`, `fieldRequired`, `fieldValues` (keyed by field ID)
- Dynamic fields: `extraFields: ExtraField[]`
- Chat: `messages: Message[]`, `chatInput`

**Command parser:** The chat input is parsed as plain strings in a single `handleSend` function. Commands map directly to `setState` calls — no external state library.

**Static field IDs** (`STATIC_FIELD_IDS`): `first-name`, `last-name`, `email`, `phone`, `dob`, `insurance-type`, `password`, `confirm-password`. Dynamic fields get IDs auto-generated from their label (lowercased, spaces → dashes).

**Layout:** Two-column flex — left side is the live form preview (max-width 480px), right side is a fixed 320px chat panel with scrollable message history.

## Key Types

```typescript
type MsgCls = 'bot' | 'user' | 'bot ok' | 'bot err'
interface Message { text: string; cls: MsgCls }
interface ExtraField { label: string; fieldId: string }
```

## Chat Commands (both versions)

See `app-v1-only-html-js-manipulation/COMMANDS.md` for the full command reference. The command set is identical between v1 and v2.

## TypeScript Config

Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` — all enabled. Target: ES2022.

# AGENTS.md

This document provides guidelines for agents working in this codebase.

## Project Overview

- **Framework**: TanStack Start (React 19 + TanStack Router)
- **Styling**: Tailwind CSS v4 with daisyUI + custom CSS variables
- **Database**: Drizzle ORM + better-sqlite3
- **Testing**: Vitest
- **Linting**: ESLint (TanStack config) + Prettier

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Development server (port 3000)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run all tests
pnpm test src/file.test.tsx    # Run single test file
pnpm test --watch     # Watch mode
pnpm lint             # ESLint
pnpm format           # Prettier check
pnpm check            # Fix lint + format
pnpm tsc --noEmit     # Type check
```

## TypeScript

- **Strict mode** enabled, **no `any`**, use proper generics
- **Path aliases**: `#/*` → `./src/*`, `@/*` → `./src/*`
- **JSX**: `react-jsx` (React 19 new transform)
- **Explicit return types** for exported functions
- **No unused locals/parameters**

## Code Style

| Category            | Convention                                     |
| ------------------- | ---------------------------------------------- |
| Print width         | 160 chars                                      |
| Strings             | Single quotes                                  |
| Semicolons          | No                                             |
| Components          | PascalCase files, named/named exports          |
| Functions/variables | camelCase                                      |
| Constants           | UPPER_SNAKE_CASE or camelCase                  |
| Routes              | kebab-case (`/chains/new`, `/chains/$chainId`) |

### Import Order

1. External libraries
2. Path aliases (`#/` or `@/`)
3. Relative imports (`../`, `./`)

- **Note**: `import/order` rule is disabled

## File Structure

```
src/
├── components/       # Reusable React components
├── constants/        # Constants and utilities
├── db/               # Drizzle schema and connection
├── routes/           # TanStack Router file-based routes
│   ├── __root.tsx    # Root layout
│   └── chains/       # Route group for /chains/*
├── server/           # Server-side logic
├── styles.css        # Global styles
└── router.tsx        # Router configuration
```

## React Components

```tsx
// Page component - default export
export const Route = createFileRoute("/path")({ component: RouteComponent });

// UI component - named export
export default function Header() { ... }

// Props - inline type
function Component({ name }: { name: string }) { ... }
```

## TanStack Router

```tsx
// Dynamic route params
export const Route = createFileRoute("/chains/$chainId")({ ... });
Route.useParams().chainId

// Navigation with Link
import { Link } from "@tanstack/react-router";
<Link to="/chains/$chainId" params={{ chainId: "1" }} />

// Active link styling
<Link activeProps={{ className: "nav-link is-active" }} />
```

## Tailwind CSS

- Use daisyUI component classes (`btn`, `card`, `card-body`)
- Custom CSS variables: `var(--sea-ink)`, `var(--header-bg)`, `var(--line)`
- Asset imports: `import css from "../styles.css?url"`

## Server Functions

```tsx
import { createServerFn } from "@tanstack/react-start";

const getData = createServerFn({ method: "GET" }).handler(async () => {
  return {
    /* data */
  };
});
```

## API Routes

```tsx
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => json({ message: "Hello" }),
    },
  },
});
```

## Error Handling

- `try/catch` for async operations
- Log errors with context: `console.error("[ComponentName]", "message:", err)`
- Return early on error conditions
- TypeScript guards for type narrowing

## Testing (Vitest)

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Git

- No commit hooks enforced
- Standard workflow, branch from main

## Known Issues

- **Avoid using `pnpm dev` to achieve goals**: The development server is designed to run continuously and does not exit automatically. Tasks that rely on file generation (e.g., updating TanStack file-based routing tree, generating types) will hang indefinitely when run through `pnpm dev`. Use build commands or direct scripts instead.

## Project Context

### ID 设计
- **chain.id**: 内部 UUID（如 `c2cca98c-d46a-45d3-a382-bae720e7d54f`）
- **shareKey**: 用户友好的分享码（如 `AAHK-PNF4-99AD-S2HS`）
- URL 使用 shareKey，数据库关联使用 id

### 会话管理
- 每个讨论串独立的 sessionId，存储在 localStorage 的 `quickleap_sessions` 对象中
- client.ts 中的 `getSessionId(chainId)` 和 `setSessionId(chainId, id)` 管理会话

### API 端点
- `/api/chains/$chainId/` - 通过内部 ID 获取讨论串数据
- `/api/chains/$shareKey/` - 通过分享码获取讨论串数据
- 投票相关接口需要 `x-session-id` 头

### 投票逻辑
- `castVote` 同时检查 session_id + chain_id 来判断是否更新现有投票
- GET 接口返回 `hasVoted`、`userVote`、`userReason` 用于刷新恢复投票状态

## Design Context

QuickLeap uses the impeccable skill for design work. Key files:

- **PRODUCT.md** — Strategic context: register (product), users, brand personality (fast, clear, decisive), anti-references, design principles
- **DESIGN.md** — Visual system: Sea Glass palette (teal primary, warm-tinted neutrals), Fraunces + Manrope typography, component specs, do's/don'ts
- **DESIGN.json** — Machine-readable sidecar with tonal ramps, shadow tokens, component HTML/CSS snippets

**Register:** product (app UI serving teams making decisions)

**Design Principles:**
1. Decisive by default — every interaction moves users toward a decision
2. Structured clarity — clear hierarchy like Notion
3. Speed over delight — animations only when they accelerate understanding
4. Opinionated simplicity — strong defaults, minimal configuration

**Key Rules:**
- No pure #000 or #fff — every neutral tints toward brand teal (chroma 0.005–0.02)
- Primary teal ≤15% of any surface (The Decisive Accent Rule)
- Typography scale ratio ≥1.25 between steps
- Body text capped at 70ch
- Flat at rest, shadows only on interaction

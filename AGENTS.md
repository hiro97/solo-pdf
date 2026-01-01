# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router project. Route segments live in `app/` with each page defined by a `page.tsx`; shared layout and metadata live in `app/layout.tsx`. UI is organized under `components/` by domain (`components/editor`, `components/nav`, `components/seo`) and `components/ui` for shadcn/ui primitives. Shared utilities and constants live in `lib/`. Global styling is in `styles/` (see `styles/globals.css`), and static assets live in `public/`. Project docs live in `docs/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local dev server at http://localhost:3000.
- `npm run build`: create a production build.
- `npm run start`: run the production build locally.
- `npm run lint`: run Next.js ESLint checks.

## Coding Style & Naming Conventions
Use TypeScript/React with 2-space indentation, double quotes, and no semicolons, matching existing files. Components are PascalCase (`EditorToolbar.tsx`), hooks are camelCase with a `use` prefix (`usePDFDocument.ts`), and route folders use kebab-case (`app/merge-pdf`). Prefer the `@/` path alias for root imports. Tailwind is the primary styling approach; keep global styles in `styles/globals.css`.

## Testing Guidelines
No automated test runner is configured. For now, rely on `npm run lint` plus manual checks in the browser. If you add a test framework, place tests alongside modules or in `__tests__/` and use `*.test.tsx` naming, then update `package.json` scripts accordingly.

## Commit & Pull Request Guidelines
Git history uses a Conventional Commits style such as `feat: ...`; follow the same type-prefix pattern (`feat:`, `fix:`, `docs:`, `chore:`) with a short, imperative summary. PRs should include a clear description, testing notes, and screenshots for UI changes; link issues when applicable.

## Privacy & Security Considerations
This project is positioned as privacy-first and client-side. Avoid introducing server-side upload flows for PDF data; if a new dependency or service changes data handling, document it in `README.md`.

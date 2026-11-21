<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project checks

Use Bun for project commands. Before finishing code changes, run the formatting check and linter:

```bash
bun run format:check
bun run lint
```

For changes that affect the production app, also run:

```bash
bun run build
```

`bun run format` rewrites files; use it only when you intend to apply formatting fixes. This project does not currently define a test script.

## Project conventions

- Keep changes scoped; leave unrelated working-tree changes untouched.
- Never print, hardcode, or commit secrets. Document required environment variable names in `.env.example`.
- For UI changes, preserve responsive layouts, light and dark themes, and visible keyboard focus states.

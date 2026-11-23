---
name: using-js-lsp-workflow
description: "WHEN you navigate, rename or refactor TypeScript symbols in Tastebench, or check callers before you change an exported function or type."
---

# Using the JS LSP workflow in Tastebench

**Dependency:** this skill uses the built-in Claude Code `LSP` tool. The `mcp-context-facade` plugin supplies the JS/TS server (`typescript-language-server`) through `lspServers`. The server starts on the first `LSP` call for a JS/TS file. Its launcher looks for the server on `PATH`, in the nvm default Node, then in Homebrew. The repo sets `typescript-lsp@claude-plugins-official` to `false`, so only the facade server claims `.ts` and `.tsx`.

## Before you change TS code

1. Find the symbol with `documentSymbol` or `workspaceSymbol` (for example `computeResults`, `RoomContextValue`).
2. Confirm the declaration and type with `goToDefinition` and `hover`.
3. Find callers with `findReferences` before you change an export. Exports in `src/domain/types.ts` and `src/firebase/rooms.ts` have callers in tests and `vi.mock` factories too.
4. Read the diagnostics that Claude Code pushes after each edit. The `LSP` tool has no diagnostics operation.
5. Use text search only for non-symbol strings: button labels, rule text in `firestore.rules`, CSS classes.

## Operation choice

| Task | Operation |
|---|---|
| Definition of a function, const or type | `goToDefinition` |
| Callers before a change | `findReferences` |
| Parameter and return types | `hover` |
| Members of a file | `documentSymbol` |
| Symbol across the repo | `workspaceSymbol` |

## Refactor safely

1. `findReferences` on the declaration.
2. The `LSP` tool has no rename. Edit each reference, then run `findReferences` again.
3. Search `vi.mock('../firebase/rooms'` factories by name: they list functions as object keys, which the server does not link to the export.
4. Run `pnpm exec tsc -b` and `pnpm test`. When diagnostics and `tsc` disagree, trust `tsc`.

## When the LSP is not available

State it, use text search limited to `*.ts,*.tsx`, avoid broad renames, and run `pnpm exec tsc -b` before you call the work done. If results look stale, run `pnpm install`, then restart the session.

When this skill shaped the work, add this block to the final report:

```text
JS LSP workflow report
- LSP available: yes|no
- Semantic operations used: <operations or none>
- References checked before refactor: yes|no|not applicable
- Diagnostics checked: yes|no
- Import handling: <tool-assisted|manual|not applicable>
- Fallbacks used: <none or fallback reason>
- Validation: <command/result or not run with reason>
```

_Source: using-js-lsp-workflow (repo-onboarder 6.0.0)._

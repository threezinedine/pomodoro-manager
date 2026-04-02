# Code Style Guide

## Editor Config

All files in the project must use:

- **Tab size:** 4 spaces (no tab characters)
- **Indent size:** 4
- **End of line:** `lf`
- **Charset:** `utf-8`
- **Trim trailing whitespace:** yes
- **Insert final newline:** yes

Root `.editorconfig` at project root applies to **all** files (client, server, infra).

---

## TypeScript / JavaScript

| Rule | Value |
|---|---|
| Tab size | 4 spaces |
| Semicolons | No |
| Quotes | Single quotes `'` |
| Trailing commas | ES5 (multiline only) |
| Print width | 100 characters |
| Single quote for JSX | No (`"`) |

### ESLint (server + client)

```jsonc
// server/.eslintrc.json / client/.eslintrc.json
{
  "env": {
    "es2022": true,
    "node": true,          // server only
    "browser": true        // client only
  },
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"   // client only
  ],
  "rules": {
    "indent": ["error", 4, { "SwitchCase": 1 }],
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

### Prettier

```jsonc
// .prettierrc (root)
{
  "tabWidth": 4,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

**Note:** Prettier runs AFTER ESLint (via `lint-staged` pre-commit hook). ESLint's `indent`, `quotes`, and `semi` rules must be disabled when Prettier is in use to avoid conflicts:

```jsonc
// .eslintrc.json overrides
"rules": {
  "indent": "off",
  "quotes": "off",
  "semi": "off"
}
```

---

## CSS / SCSS

| Rule | Value |
|---|---|
| Tab size | 4 spaces |
| Property colon spacing | No space before, one space after |
| Block brace | Same line |

CSS custom properties (`--var-name`) are preferred over hardcoded values. Each component that uses theme-aware colours should reference CSS variables defined in `themes.scss`.

---

## Import ordering (TypeScript/JS)

1. React / framework imports
2. Third-party libraries
3. Internal absolute imports (`@/...`)
4. Relative imports (`./...`, `../...`)
5. Type imports (`import type { ... }`)

Separated by a blank line. Enforced by ESLint import plugin.

---

## Naming conventions

| Construct | Convention | Example |
|---|---|---|
| Components | PascalCase | `Button.tsx`, `TaskList.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth.ts`, `useToast.ts` |
| Stores (Zustand) | camelCase, `Store` suffix | `authStore.ts`, `tasksStore.ts` |
| Services / API | camelCase, `Api` suffix | `authApi.ts`, `taskApi.ts` |
| SCSS modules | Same as component | `Button.module.scss` |
| CSS variables | kebab-case | `--bg-surface`, `--color-accent` |
| Test files | Same as component + `.test` | `Button.test.tsx` |
| Story files | Same as component + `.stories` | `Button.stories.tsx` |

---

## Git commit hook

`husky` + `lint-staged` runs `eslint --fix` + `prettier --write` on staged `.ts` / `.tsx` / `.scss` files before each commit.

---

## Enforcement

- **CI:** `eslint` and `prettier --check` run in CI for both `client/` and `server/` to fail the build on style violations.
- **Editor:** Install the ESLint and Prettier VS Code extensions with `editor.formatOnSave: true` and `editor.codeActionsOnSave: "fix"` for zero-effort formatting.

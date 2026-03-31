# Frontend Architecture Guide

> This document defines the standard directory structure and conventions for the frontend application. It is designed to be **modular** — add or remove sections based on your project's needs.

---

## Overview

The frontend follows a **feature-based** architecture with a strict split between presentational and stateful layers:

- **`components/`** — Pure, presentational UI building blocks. All state is passed in via props. No internal state, no side effects, no business logic. Examples: `Button`, `Modal`, `Toast` (display-only).
- **`features/`** — Stateful wrappers around `components/`, bundled with their own logic. Each feature owns its state (store, hook, or prop), and its components compose and manage the primitives from `components/`. Examples: `toast/` (show/hide + queue), `auth/` (login flow), `billing/` (checkout).
- **`pages/`** — Route-level components that compose features and layouts.

This separation keeps `components/` genuinely reusable across the entire app, while each feature remains self-contained and testable.

---

## Directory Tree

```plaintext
frontend/
├── src/
│   ├── stories/                     # Storybook configuration & stories
│   │
│   ├── components/                  # Pure presentational UI components (stateless)
│   │   ├── button/
│   │   │   ├── Button.tsx           # Component implementation
│   │   │   ├── Button.scss           # Component styles (BEM / CSS Modules)
│   │   │   ├── Button.test.tsx      # Unit tests  ✅ required
│   │   │   ├── Button.stories.tsx   # Storybook story  ✅ required
│   │   │   └── index.tsx            # Public barrel export
│   │   ├── form/
│   │   ├── modal/
│   │   └── toast/
│   │       ├── Toast.tsx            # Stateless — accepts message, type, visible as props
│   │       ├── Toast.scss
│   │       ├── Toast.test.tsx
│   │       ├── Toast.stories.tsx
│   │       └── index.tsx
│   │
│   ├── layout/                      # Page layout wrappers
│   │   └── default/
│   │       ├── DefaultLayout.tsx    # Layout component (header, sidebar, footer)
│   │       ├── DefaultLayout.scss
│   │       └── index.tsx
│   │
│   ├── pages/                       # Route-level page components
│   │   └── login/
│   │       ├── LoginPage.tsx
│   │       ├── LoginPage.scss
│   │       └── index.tsx
│   │
│   ├── features/                    # Stateful wrappers around components/ + domain logic
│   │   ├── toast/                   # Toast queue & show/hide state
│   │   │   ├── components/
│   │   │   │   └── ToastProvider/
│   │   │   │       ├── ToastProvider.tsx  # Wraps Toast (from components/), manages queue
│   │   │   │       └── index.tsx
│   │   │   ├── stores/
│   │   │   │   └── toastStore.ts    # Internal state (queue, visibility)
│   │   │   └── utils/               # Toast formatting helpers (optional)
│   │   └── auth/
│   │       ├── components/
│   │       │   └── AuthForm/
│   │       │       ├── AuthForm.tsx
│   │       │       ├── AuthForm.scss
│   │       │       ├── AuthForm.test.tsx  # optional
│   │       │       ├── AuthForm.stories.tsx  # optional
│   │       │       └── index.tsx
│   │       ├── services/             # Feature-specific API calls
│   │       ├── hooks/                # Feature-specific custom hooks
│   │       └── utils/                # Feature-specific utility functions
│   │
│   ├── services/                    # Global / shared API services
│   ├── hooks/                       # Global / shared custom hooks
│   ├── utils/                       # Global / shared utility functions
│   ├── global/                      # Global styles, theme, context providers
│   │   ├── global.css
│   └── App.tsx                      # Root application component
│
├── public/                          # Static assets (served as-is)
├── package.json
└── README.md
```

---

## Key Notes

### 1. Component Contract (`components/`)

Components in `components/` are **pure and stateless**. All state is injected via props — no internal `useState`, no side effects, no direct store subscriptions. This is what makes them safe to reuse anywhere.

Every component **must** include `index.tsx`, `.test.tsx`, and `.stories.tsx`. These files are the minimum contract.

```plaintext
ComponentName.tsx          → implementation (stateless, props only)
ComponentName.scss        → styles
ComponentName.test.tsx    → unit / integration test  ✅ required
ComponentName.stories.tsx → Storybook story          ✅ required
index.tsx                 → public barrel export
```

> **Why?** The `.test.tsx` ensures the component stays working. The `.stories.tsx` provides living documentation via Storybook.

### 2. Feature Modules are Stateful Wrappers (`features/`)

A feature module wraps `components/` and adds its own state. This is the key rule: **feature components compose and manage the stateless primitives from `components/`**.

```plaintext
features/toast/                  # Example: toast queue state
├── components/
│   └── ToastProvider/           # Stateful — consumes toastStore, maps queue to Toast
│       ├── ToastProvider.tsx
│       └── index.tsx
├── stores/
│   └── toastStore.ts            # Internal state (queue, show/hide, duration)
└── utils/                       # Toast formatting helpers

features/auth/
├── components/
│   └── AuthForm/               # Stateful — manages form state, calls auth service
│       ├── AuthForm.tsx
│       ├── AuthForm.scss
│       └── index.tsx
├── services/                    # auth API calls
├── hooks/                      # auth-specific stateful logic
└── utils/                      # auth-specific helpers
```

Unlike `components/`, tests and stories inside `features/` are **optional**. Add them only when the component is complex enough to benefit.

### 3. Components vs Features — When to Use Which

| Location      | Presence of state                                  | How it works                                               |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `components/` | **None** — all state passed in via props           | Import from `components/` and use directly in a feature.   |
| `features/`   | **Owns internal state** (store, hook, local state) | Wrap `components/` to add state management + domain logic. |
| `pages/`      | **None** (just composing)                          | Import features and layouts to assemble a route.           |

### 4. Layout System (`layout/`)

Layouts wrap pages and provide the page shell (navigation, sidebars, footers). Each layout lives in its own folder with its own styles. Pages import the layout they need.

```plaintext
layout/
└── default/           → main app layout (sidebar + header + content)
    ├── DefaultLayout.tsx
    ├── DefaultLayout.scss
    └── index.tsx
```

### 5. Shared Layer (`services/`, `hooks/`, `utils/`)

These directories hold code that is shared across multiple features but is not a UI component. Use them for:

- **`services/`** — HTTP clients, API configuration, global data-fetching utilities.
- **`hooks/`** — Shared custom React hooks (e.g., `useDebounce`, `useLocalStorage`).
- **`utils/`** — Pure helper functions (e.g., date formatting, validation helpers).

### 6. Storybook Integration (`stories/`)

The `stories/` directory at the top level holds Storybook configuration and stories that don't belong to a single component (e.g., addon config, decorator setup). Individual component stories live next to their components as `.stories.tsx` files.

### 7. Barrel Exports (`index.tsx`)

Every component and feature module exposes a public API via `index.tsx`. This allows clean imports without exposing internal implementation details:

```tsx
// Good
import { Button } from '@/components/button';

// Avoid
import { Button } from '@/components/button/Button';
```

### 8. Theme 

The theme features should be implemented:
- in the `global.css` shoule be like:
  - ```css
    .light {
      --color-primary: #0070f3;
      --color-secondary: #1c1c1e;
      --color-background: #ffffff;
      --color-text: #333333;
      /* Add more theme variables as needed */
    }

    .dark {
      --color-primary: #0a84ff;
      --color-secondary: #1c1c1e;
      --color-background: #000000;
      --color-text: #ffffff;
    }
    ```
  ```

Theme switching can be implemented by toggling the `light` and `dark` classes on the root element (e.g., `<body>` or a top-level `<div>`). This allows for easy theme management across the entire application.

---

## Import Conventions

```tsx
// Component import (stateless, use directly)
import { Button } from '@/components/button';

// Feature import — feature components own their state
import { ToastProvider } from '@/features/toast/components/ToastProvider';
import { AuthForm } from '@/features/auth/components/AuthForm';

// Layout import
import { DefaultLayout } from '@/layout/default';

// Hook import
import { useAuth } from '@/features/auth/hooks/useAuth';
```

---

## Development Commands

See [`test-commands.md`](./test-commands.md) for the full list of available scripts.

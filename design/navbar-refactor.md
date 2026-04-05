# Navbar Refactor Plan

## Problem

The current `layout/Header/` is **impure** — it owns auth state internally (`AUTH_KEY`, `localStorage.removeItem`, `window.location.href`) and determines its own behaviour, making it untestable and non-reusable.

The app architecture contract is clear:

| Layer | Rule |
|---|---|
| `components/` | Pure, stateless — all state via props |
| `layout/` | Pure layout wrappers — presentational only |
| `features/` | Stateful — owns internal state and domain logic |

The Header lives in `layout/` but violates this by having internal state.

---

## Goal

Split into two things:

1. **`layout/Header/`** → purely presentational, receives all data via props
2. **`features/navbar/`** → stateful feature module that owns auth/route/panel state, wires Header via props

---

## New Directory Structure

```
client/src/
├── layout/
│   └── Header/
│       ├── Header.tsx            ← refactor: all props, no internal state
│       ├── Header.module.scss    ← unchanged
│       └── index.ts             ← unchanged
│
├── features/
│   └── navbar/
│       ├── components/
│       │   └── Navbar/           ← stateful component, wires Header + Zustand store
│       │       ├── Navbar.tsx
│       │       ├── Navbar.module.scss
│       │       └── index.ts
│       ├── stores/
│       │   └── navbarStore.ts   ← Zustand: isStatsOpen, isSettingsOpen, toggleStats, toggleSettings
│       └── index.ts
```

**Note:** Auth (`AUTH_KEY`, logout, `window.location.href`) is moved out of Header entirely — it lives in `features/auth/` (which already owns the auth store per the architecture). The Navbar feature will call `useAuthStore()` to trigger logout.

---

## What Changes

### 1. Refactor `layout/Header/Header.tsx`

**Before** (impure):
```tsx
const AUTH_KEY = 'auth_token';

export const Header = () => {
  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/';
  }, []);

  return (
    <header>
      <Button onClick={handleLogout}>Sign Out</Button>
      ...
    </header>
  );
};
```

**After** (pure):
```tsx
interface HeaderProps {
  onLogout: () => void;
  onToggleStats?: () => void;
  onToggleSettings?: () => void;
  isStatsOpen?: boolean;
  isSettingsOpen?: boolean;
  // ... existing props
}

export const Header: React.FC<HeaderProps> = ({ onLogout, ... }) => {
  return (
    <header>
      <Button onClick={onLogout}>Sign Out</Button>
      ...
    </header>
  );
};
```

### 2. Create `features/navbar/`

- **`navbarStore.ts`** — Zustand store for panel open/close state:
  ```ts
  isStatsOpen: boolean       // collapsible stats panel toggle
  isSettingsOpen: boolean     // settings drawer toggle
  toggleStats(): void
  toggleSettings(): void
  ```
- **`Navbar.tsx`** — wires `Header` via props, calls `useAuthStore().logout` for logout, manages panel state via `navbarStore`

### 3. Update `DashboardLayout`

`DashboardLayout` already accepts `statsToggle` and `extraActions` as slots — it should accept a `navbar` prop or `header` slot for full flexibility. The Navbar feature replaces the inline header usage.

### 4. Update `DashboardPage`

Replace any direct Header usage with the Navbar feature:
```tsx
import { Navbar } from '@/features/navbar';

export const DashboardPage = () => (
  <DashboardLayout
    sidebar={<Sidebar />}
  >
    <Navbar />
    <CalendarView />
  </DashboardLayout>
);
```

---

## Tasks to Add

In `design/tasks.md`, add a new task group after task 20:

```
- [ ] 20b. Refactor Header to be stateless, create Navbar feature
    - [ ] 20b.1. Refactor layout/Header/Header.tsx — remove all internal state, add onLogout, onToggleStats, onToggleSettings props
    - [ ] 20b.2. Create features/navbar/stores/navbarStore.ts — Zustand: isStatsOpen, isSettingsOpen, toggleStats, toggleSettings
    - [ ] 20b.3. Create features/navbar/components/Navbar/Navbar.tsx — wires Header, calls authStore.logout
    - [ ] 20b.4. Create Navbar.module.scss and index.ts
    - [ ] 20b.5. Update DashboardLayout to accept a header slot (replacing inline Header)
    - [ ] 20b.6. Update DashboardPage to use Navbar feature
    - [ ] 20b.7. Add Navbar.test.tsx — tests: logout call, stats/settings toggle
    - [ ] 20b.8. Add Navbar.stories.tsx
```

---

## Files Modified / Created

| File | Action |
|---|---|
| `client/src/layout/Header/Header.tsx` | Refactor — remove state, add props |
| `client/src/layout/Header/Header.module.scss` | Unchanged |
| `client/src/layout/Header/index.ts` | Unchanged |
| `client/src/layout/dashboard/DashboardLayout.tsx` | Update to accept `header` slot |
| `client/src/features/navbar/stores/navbarStore.ts` | **Create** |
| `client/src/features/navbar/components/Navbar/Navbar.tsx` | **Create** |
| `client/src/features/navbar/components/Navbar/Navbar.module.scss` | **Create** |
| `client/src/features/navbar/components/Navbar/Navbar.test.tsx` | **Create** |
| `client/src/features/navbar/components/Navbar/Navbar.stories.tsx` | **Create** |
| `client/src/features/navbar/index.ts` | **Create** |
| `client/src/pages/DashboardPage/DashboardPage.tsx` | Update to use Navbar |
| `design/tasks.md` | Add 20b tasks |

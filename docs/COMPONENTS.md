# Component folder structure

This template uses a **feature + shared UI** layout (not Atomic Design by default). It scales well for small and medium apps without extra ceremony.

**Styling:** see **[COMPONENT-STYLES.md](./COMPONENT-STYLES.md)** for how to create components with colocated styled-jsx, tokens, and shared primitives.

```
src/components/
├── ui/           # Reusable, domain-agnostic pieces (Button, Loader, Input…)
├── auth/         # Sign-in, sign-up, guards, OAuth controls
├── layout/       # Page shells, headers, nav wrappers
├── landing/      # Public marketing page sections (hero, problem, FAQ…)
└── <feature>/    # Add when a domain grows (e.g. billing/, settings/)
```

## Rules of thumb

| Put it in… | When… |
|------------|--------|
| **`ui/`** | No business rules; could ship in any product (buttons, spinners, modals shell). |
| **`auth/`** | Login, register, session guards, identity providers. |
| **`layout/`** | Structure around pages (home shell, dashboard frame, sidebar layout). |
| **`landing/`** | Public marketing sections (hero, problem, solution, FAQ, footer). |
| **`dashboard/floorBoard/`** | Floor kanban board (To do → Doing → Approve → Done). See **[FLOOR-BOARD.md](./FLOOR-BOARD.md)**. |
| **`admin/swarms/`** | Swarm editor, worker tools UI. See **[SWARMS-TOOLS.md](./SWARMS-TOOLS.md)** (backend: **`agentatlas-services/docs/TOOLS.md`**). |
| **`<feature>/`** | Tied to one product area with its own vocabulary (3+ related components). |

## Imports

Use the full path (clear and grep-friendly):

```ts
import Button from "@/components/ui/Button"
import SignInForm from "@/components/auth/SignInForm"
import HomeShell from "@/components/layout/HomeShell"
```

Optional barrel files (`index.ts`) only if a folder exports many symbols and imports get noisy.

## Styling customization (what to edit when you rebrand)

Global tokens + styles inside each component file. Full conventions: **[COMPONENT-STYLES.md](./COMPONENT-STYLES.md)**. When you rebrand, **start with tokens**, then adjust the components users see most (auth forms, landing hero, buttons).

### 1) Tokens (always first)

- **File**: `src/app/globals.css`
- **Edit**: `:root` variables (`--app-*`) and the `--app-font` stack.
- **Why**: most UI (auth, home shell, buttons, loader, toast theme) keys off these variables.

### 2) Forms (primary surface to personalize)

Auth screens are the highest-touch UI in the template, so your brand will mostly show through here.

- **Files**:
  - `src/components/auth/SignInForm.tsx`
  - `src/components/auth/SignUpForm.tsx`
  - `src/components/auth/auth.module.css` (form fields, validation, divider)
  - `src/components/auth/auth-page.module.css` (page shell + card)
  - `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx` (wire page layout)
- **Common tweaks**:
  - Increase radius/shadows for a softer SaaS look.
  - Adjust focus ring (color + thickness) for accessibility and brand.
  - Swap the Google button presentation (`src/components/auth/GoogleAuthButton.tsx`) to match your button system.

### 3) Toasts (secondary but very visible feedback)

Toasts should match your theme tokens and typography; otherwise they look “bolted on”.

- **Files**:
  - `src/app/toastify-theme.css` (visual theme)
  - `src/app/providers.tsx` (ToastContainer options: position, theme, timings)
  - `src/lib/toast.ts` (API used by the app)
- **What to customize**:
  - Background/border/shadow via Toastify CSS variables
  - Success/error colors and progress bar
  - Font family + size to match the rest of the UI

### 4) Shared UI components (only if needed)

- **Buttons**: `src/components/ui/Button.tsx`
- **Loader**: `src/components/ui/Loader.tsx`

These are small but they set the tone across the app (primary CTA, loading states).

## What we avoid in this template

- **`atoms/` / `molecules/` / `organisms/`** — useful for large design systems; overkill for a starter.
- **Flat `components/*.tsx`** — fine for 3 files; breaks down past ~10.
- **Mirroring `app/` 1:1** — routes and UI lifecycle differ; group by domain, not by URL.

## Adding a new feature

1. Create `src/components/<feature>/`.
2. Keep route files in `src/app/...` thin: compose feature components there.
3. If `<feature>` needs one-off UI, still prefer `ui/` when the piece is generic.

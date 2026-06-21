# Component styling guide

How to build UI in this template: **design tokens globally**, **styles colocated in each component** (styled-jsx), and **small shared wrappers** when the same markup repeats.

Related: [COMPONENTS.md](./COMPONENTS.md) (folder layout), [LANDING.md](./LANDING.md) (marketing page), [FONTS.md](./FONTS.md) (typography).

---

## Architecture (three layers)

| Layer | Where | Purpose |
|-------|--------|---------|
| **Tokens** | `src/app/globals.css` (`:root` `--app-*`) | Colors, radius, shadows, font stack, button + focus tokens. Never put feature-specific layout here. |

### Button & color tokens (minimal + subtle polish)

Defined in `globals.css` and consumed by `LandingButton`, `ui/Button`, and auth:

| Token | Role |
|-------|------|
| `--app-btn-primary-*` | Near-black fill, white label, inset highlight + soft shadow on hover |
| `--app-btn-secondary-*` | White surface, strong border; hover darkens border to `--app-text` |
| `--app-btn-ghost-*` | Transparent; hover adds surface + hairline border |
| `--app-btn-focus-ring` | Double ring: page bg + `--app-accent` (keyboard only via `:focus-visible`) |
| `--app-accent` / `--app-accent-soft` | Focus rings, links, rare highlights — not the default CTA fill |

**Elegant details (keep flat):** inset top highlight on primary, `translateY(0.5px)` on `:active`, accent focus ring, secondary border darkens on hover. Avoid gradients on buttons and heavy drop shadows.
| **Component styles** | `<style jsx>` at the bottom of the same `.tsx` | Scoped layout and look for that component only. |
| **Shared primitives** | `ui/`, or domain helpers (e.g. `landing/LandingButton.tsx`) | Reused markup + styles when 3+ call sites need the same thing. |

**Do not** add new global class blocks to `globals.css` for pages or features. If you need a one-off screen, style it in that screen’s component.

---

## Default pattern: styled-jsx in the component file

This matches `Button`, `Loader`, `GoogleAuthButton`, and landing sections.

### Minimal example (`ui/`)

```tsx
type Props = { label: string }

export default function Badge({ label }: Props) {
  return (
    <span className="badge">{label}</span>
    <style jsx>{`
      .badge {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        color: var(--app-text-muted);
        background: var(--app-surface);
        border: 1px solid var(--app-border);
        border-radius: 999px;
      }
    `}</style>
  )
}
```

### Rules

1. **Use `var(--app-*)` tokens** for colors, borders, radius, and shadows — not hardcoded hex (except rare one-offs like pure white on a dark CTA).
2. **Place `<style jsx>` after the JSX** in the same `return` (sibling to the root element, or wrap in a fragment if you need multiple roots).
3. **Class names are local** to the file (styled-jsx hashes them). Use simple names: `.title`, `.card`, `.grid` — no BEM prefix required unless it helps readability.
4. **Modifiers** via extra classes on the element: `className="btn btn--primary"`, not separate CSS files.
5. **Children inside wrappers** still receive scoped classes from the parent file when they are passed as `children` in the same component (e.g. `<LandingContainer><p className="title">` in `FeaturesSection.tsx`).

### Variants and composition

```tsx
const variantClass = variant === "primary" ? "btn--primary" : "btn--secondary"

<button className={`btn ${variantClass}`.trim()}>
  ...
</button>
```

Reference: `src/components/ui/Button.tsx`.

### Pseudo-elements and nested tags

Use `:global()` when the selector targets a raw HTML element inside a wrapper you do not control:

```tsx
<blockquote className="quote">
  <p>...</p>
  <footer>...</footer>
</blockquote>

<style jsx>{`
  .quote :global(p) {
    margin: 0 0 1rem;
  }
  .quote :global(footer) {
    font-size: 0.8125rem;
    color: var(--app-text-muted);
  }
`}</style>
```

Reference: `src/components/landing/sections/SocialProofSection.tsx`.

---

## Client vs Server Components (App Router)

**styled-jsx only works in Client Components.**

| Area | Boundary | Notes |
|------|-----------|--------|
| Landing | `"use client"` on `LandingPage.tsx` | All landing sections imported there run as client UI. No need to repeat `"use client"` on every section unless you import them elsewhere as server parents. |
| Auth forms | `"use client"` on forms / pages | `SignInForm`, `SignUpForm`, sign-in/up pages. |
| `Button`, `Loader` | Used inside client trees | Already compatible. |
| Pure static section (future) | Server Component | Use **CSS Modules** (`*.module.css`) instead of styled-jsx, or keep the section under a client parent. |

If the build fails with *"styled-jsx cannot be imported from a Server Component"*, add `"use client"` to the nearest parent that owns the tree, or switch that file to CSS Modules.

---

## When to extract a shared component

Extract to `ui/` or `<feature>/Helper.tsx` when:

- The same **markup + styles** appear in **3+ places** (e.g. `LandingButton`, `LandingContainer`).
- You need a **stable public API** (`variant`, `size`, `href`) hiding implementation detail.

Keep styles **inside that helper’s `.tsx`** with its own `<style jsx>` block.

Do **not** extract for a single use or for one line of CSS.

Landing primitives (reuse these before copying):

| Component | Role |
|-----------|------|
| `LandingSection` | `<section>` padding, borders, variants: `default` \| `muted` \| `hero` \| `cta` |
| `LandingContainer` | Centered max-width column; `narrow` prop for FAQ-width |
| `LandingButton` | `<button>` CTA; `href` navigates via router (or scrolls to `#`); `variant`, `size`, `inverted` |

---

## Creating a new landing section

1. **Copy** in `src/content/landing.ts` (keys + types).
2. **Create** `src/components/landing/sections/YourSection.tsx`.
3. **Compose** primitives + local markup; **styles only for what’s unique** to that section.
4. **Register** in `LandingPage.tsx` (order matters for narrative).
5. Optional: `header.nav` anchor → `#your-id` on `LandingSection`.

### Section template

```tsx
import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function YourSection() {
  const { yourBlock } = landingContent

  return (
    <LandingSection id={yourBlock.id} variant="muted" aria-labelledby="your-title">
      <LandingContainer>
        <p className="eyebrow">{yourBlock.eyebrow}</p>
        <h2 id="your-title" className="title">
          {yourBlock.title}
        </h2>
        {/* section-specific markup */}
      </LandingContainer>
      <style jsx>{`
        /* Only styles for classes used in THIS file */
        .eyebrow { ... }
        .title { ... }
      `}</style>
    </LandingSection>
  )
}
```

Full example: `src/components/landing/sections/FeaturesSection.tsx`.

**Copy** stays in `landing.ts` — never hardcode marketing strings in the section file.

---

## Auth and layout (CSS Modules today)

Auth and dashboard shell still use **CSS Modules** next to the component (valid for Server/Client and slightly less boilerplate on large forms):

| File | Styles |
|------|--------|
| `auth/auth.module.css` | Form fields, errors, divider |
| `auth/auth-page.module.css` | Centered page + card |
| `layout/home.module.css` | Dashboard welcome shell |

Import as `import styles from "./auth.module.css"` and `className={styles.input}`.

You may migrate these to styled-jsx later for one consistent pattern; follow the same token rules.

---

## Third-party / animated UI (21st.dev, etc.)

Per template rules:

1. Add an **isolated wrapper** under `ui/` or `<feature>/` (e.g. `AnimatedHeroBackground.tsx`).
2. Put vendor CSS and markup **inside** that wrapper with styled-jsx or a colocated module.
3. Expose a small props API (`className`, `children`, `variant`).
4. Import **only the wrapper** from pages/sections.

Never paste large snippets into `globals.css` or spread vendor classes across auth/providers.

---

## Checklist for a new component

- [ ] Lives in the right folder (`ui/`, `auth/`, `layout/`, `landing/`, `<feature>/`).
- [ ] Uses `--app-*` tokens for themeable values.
- [ ] Styles in the same `.tsx` (`<style jsx>`) or colocated `*.module.css` — not in `globals.css`.
- [ ] `"use client"` only if the file uses styled-jsx, hooks, or browser APIs.
- [ ] Copy in `content/` or `messages/` — not inline product strings (landing/auth).
- [ ] Shared pieces extracted only when reused 3+ times.
- [ ] Accessible markup (`aria-*`, heading order, focus states on interactive elements).

---

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| Growing `globals.css` with `.feature-*` pages | styled-jsx in the feature component |
| One `landing.css` for all sections | Per-section `<style jsx>` + `LandingSection` / `LandingContainer` |
| Pasting 21st.dev blocks into `page.tsx` | Wrapper component under `components/` |
| `"use client"` on every file “just in case” | Single client boundary (`LandingPage`, form page) |
| Hardcoded `#1463ff` everywhere | `var(--app-accent)` or token for primary actions |

---

## Quick reference (files)

```
src/app/globals.css              # tokens + html/body only
src/components/ui/Button.tsx     # styled-jsx reference
src/components/landing/
  LandingPage.tsx                # "use client" — landing entry
  LandingSection.tsx             # shared section shell + styles
  LandingContainer.tsx
  LandingButton.tsx
  sections/FeaturesSection.tsx   # section + local styled-jsx
src/components/auth/auth.module.css
src/content/landing.ts           # marketing copy
```

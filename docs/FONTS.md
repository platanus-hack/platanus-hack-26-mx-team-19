# Recommended fonts

Google Fonts that work well with this template’s light UI. Load them with [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for zero layout shift and no extra requests at runtime.

**Shipped default:** [Red Hat Display](https://fonts.google.com/specimen/Red+Hat+Display) (`src/config/fonts.ts` + literal `--app-font` in `globals.css`).

---

## Wiring fonts (read this when switching)

| Step | File | Action |
|------|------|--------|
| 1 | `src/config/fonts.ts` | `next/font/google` loader, `variable: "--font-<slug>"` |
| 2 | `src/app/layout.tsx` | `className={appFont.variable}` on `<body>` |
| 3 | `src/app/globals.css` | **`--app-font` with the literal family name** + system fallbacks |

### Do not use `var(--font-*)` inside `:root` `--app-font`

`next/font` defines `--font-red-hat-display` on **`<body>`** via `appFont.variable`, not on `:root`.

```css
/* Wrong — undefined on :root, falls back to system-ui */
--app-font: var(--font-red-hat-display), system-ui, sans-serif;

/* Correct — matches the loader family name */
--app-font: "Red Hat Display", system-ui, -apple-system, "Segoe UI", sans-serif;
```

You may use `var(--font-red-hat-display)` on elements **under `<body>`**; do not use it when defining `--app-font` on `:root`.

---

## Red Hat Display (default)

- **Style:** geometric display sans, open shapes, strong at large sizes  
- **Good for:** minimal SaaS landing, product UI, tight headlines with flat color  
- **Pair with:** Red Hat Text for long body copy if you split display/body later  

```ts
import { Red_Hat_Display } from "next/font/google"

export const appFont = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css` (`:root`):

```css
--app-font: "Red Hat Display", system-ui, -apple-system, "Segoe UI", sans-serif;
```

Use `--app-tracking-tight` on hero titles; body stays at default tracking.

---

## Poppins

- **Style:** geometric sans-serif  
- **Good for:** product UI, forms, dashboards, marketing blocks  
- **Pair with:** Playfair Display for display headings  

```ts
import { Poppins } from "next/font/google"

export const appFont = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Poppins", system-ui, ...`

---

## Raleway

- **Style:** elegant sans with open counters  
- **Good for:** landing pages, sign-in/sign-up, light headlines  
- **Pair with:** Poppins or Plus Jakarta Sans for body  

```ts
import { Raleway } from "next/font/google"

export const appFont = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Raleway", system-ui, ...`

---

## Plus Jakarta Sans

- **Style:** neutral contemporary sans  
- **Good for:** SaaS, B2B, dense tables and data UI  
- **Pair with:** Playfair Display or Raleway for marketing hero lines  

```ts
import { Plus_Jakarta_Sans } from "next/font/google"

export const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Plus Jakarta Sans", system-ui, ...`

---

## Playfair Display (display only)

- **Style:** high-contrast serif (display)  
- **Good for:** hero titles, quotes, editorial accents — not for `--app-font`  
- **Pair with:** any sans above for paragraphs and UI  

```ts
import { Playfair_Display } from "next/font/google"

export const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

Use on specific elements, e.g. `font-family: var(--font-playfair), Georgia, serif` in styled-jsx (under `<body>`).

---

## Switching the app default

1. Replace the loader in `src/config/fonts.ts`.  
2. Keep `className={appFont.variable}` on `<body>` in `src/app/layout.tsx`.  
3. Set **`--app-font` to the literal Google Fonts family name** in `src/app/globals.css` (see **Wiring fonts** above — not `var(--font-*)` on `:root`).

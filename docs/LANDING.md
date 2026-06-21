# Landing page template

Public route: **`/`**. Authenticated app home: **`/dashboard`**.

## Section order (YC-style narrative)

| # | Section | Component | Content key |
|---|---------|-----------|-------------|
| — | Header | `LandingHeader.tsx` | `landingContent.header`, `brand` |
| 1 | Hero | `sections/HeroSection.tsx` | `hero` |
| 2 | Network | `sections/NetworkSection.tsx` | `network` |
| 3 | Solution | `sections/SolutionSection.tsx` | `solution` |
| 4 | How it works | `sections/HowItWorksSection.tsx` | `howItWorks` |
| 5 | Features | `sections/FeaturesSection.tsx` | `features` |
| 6 | Social proof | `sections/SocialProofSection.tsx` | `socialProof` |
| 7 | FAQ | `sections/FaqSection.tsx` | `faq` |
| 8 | Final CTA | `sections/FinalCtaSection.tsx` | `finalCta` |
| — | Footer | `sections/LandingFooter.tsx` | `footer` |

Composer: `src/components/landing/LandingPage.tsx`.

## Edit copy

All placeholder text lives in **`src/content/landing.ts`**. Replace brand name, headlines, metrics, and FAQ when forking.

Header actions:

- **Log in** → `/sign-in`
- **Sign up** → `/sign-up`
- **Dashboard** (when session exists) → `/dashboard`

## Edit styles

Rebrand via `--app-*` tokens in **`src/app/globals.css`** first. Section styles live in each `sections/*.tsx` via **styled-jsx** (see **[COMPONENT-STYLES.md](./COMPONENT-STYLES.md)**). Shared primitives: `LandingSection`, `LandingContainer`, `LandingButton`. `LandingPage.tsx` is a Client Component (`"use client"`) because styled-jsx requires it in the App Router.

## Add or remove a section

1. Add content to `src/content/landing.ts`.
2. Create `src/components/landing/sections/YourSection.tsx` (follow the section template in **COMPONENT-STYLES.md**).
3. Import and render it in `LandingPage.tsx`.
4. Optional: add a nav anchor in `header.nav` pointing to `#your-id`.

## i18n

Copy is English-only in `landing.ts` for now. To localize, move strings to `src/messages/en.json` / `es.json` and read them in each section (or pass a typed messages object into `LandingPage`).

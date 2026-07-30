# Project Rules — Transvolt CIS

## Product
Charging Intelligence System (CIS): the existing Transvolt platform has a
"Charging System" module currently showing "Coming Soon." This task
replaces ONLY that module's contents with a fully functional enterprise
system for managing EV charging infrastructure across multiple depots.
Users: charging operators, supervisors, maintenance engineers, cluster
leads, ops managers, finance, energy teams, executives.

## Non-negotiable scope fence
- Build only inside the "Charging System" module/route.
- Do not modify any other business module.
- Do not change the global app shell, branding, navigation hierarchy,
  typography, or theme provider.
- Do not introduce a new colour palette, spacing system, or design
  language — none of the sections below are inventions, they are pulled
  from Phase 0's analysis of the existing codebase.
- If an existing component already solves a problem, extend it — never
  create a parallel/duplicate version.
- A user should not be able to tell where the existing app ends and this
  module begins.

## Inherited from existing codebase (filled in from Phase 0)
- **Design tokens (colour, light + dark mode)**: OKLCH-based system defined in [styles.css](file:///c:/Users/Admin/OneDrive%20-%20Transvolt%20Mobility%20Private%20Limited/Salman%20UIUX/ESG%20Module/src/styles.css). Light/Dark values include `--background` (`oklch(0.982 0.006 250)` / `oklch(0.13 0.014 255)`), `--foreground` (`oklch(0.2 0.028 255)` / `oklch(0.97 0.006 250)`), `--card` (`oklch(1 0.002 250)` / `oklch(0.17 0.016 255)`), and `--primary` (`oklch(0.52 0.17 195)` / `oklch(0.78 0.15 195)`). Includes premium glassmorphism classes (`.glass`, `.cc-glass`) and custom shadows (`.shadow-elevated`).
- **Typography scale**: Display font is `"Plus Jakarta Sans", system-ui, sans-serif`. Monospace font is `"JetBrains Mono", ui-monospace, monospace`. Headings have letter-spacing `-0.025em` and font-weight `600`.
- **Spacing scale / grid**: Standard Tailwind spacing utilities (`space-y-6`, `space-y-8`, `gap-3`, `gap-4`). Main content is wrapped in a responsive container with `max-w-[1600px] px-6 py-8`.
- **Border radius / shadows / elevation**: `--radius` is set to `0.875rem` (14px). Multi-tier radii include `--radius-sm` (10px), `--radius-md` (12px), `--radius-lg` (14px), `--radius-xl` (18px), and `--radius-2xl` (22px). Box shadow uses `.shadow-elevated` for soft layers.
- **Component library in use**: Reusable custom primitives (`LivePulse`, `SeverityDot`, `RiskPill`, `GlassPanel`, `SectionShell`, `PanelHead`, `InsightTooltip`, `DeltaBadge`, `MiniSparkline` in [primitives.tsx](file:///c:/Users/Admin/OneDrive%20-%20Transvolt%20Mobility%20Private%20Limited/Salman%20UIUX/ESG%20Module/src/components/charger/command/primitives.tsx)), Recharts visual charts, and a complete suite of shadcn UI elements in [ui](file:///c:/Users/Admin/OneDrive%20-%20Transvolt%20Mobility%20Private%20Limited/Salman%20UIUX/ESG%20Module/src/components/ui) folder.
- **Routing structure, state management, theme provider**: `@tanstack/react-router` file-based routing (`routeTree.gen.ts`), `ThemeProvider` context in [use-theme.tsx](file:///c:/Users/Admin/OneDrive%20-%20Transvolt%20Mobility%20Private%20Limited/Salman%20UIUX/ESG%20Module/src/hooks/use-theme.tsx) storing theme preferences (`dark` / `light`) in `localStorage` under `voltline-theme`.
- **Folder structure and naming conventions**: Routes in `src/routes`, domain-specific components in `src/components/charger` and `src/components/intelligence`, mock types/data in `src/lib/charger-data.ts`, and analytical algorithms in `src/lib/charger-analytics.ts`.
- **Existing animation/transition, loading/empty/error state patterns**: Custom CSS class `.chart-enter` for Recharts transitions (using a fade-and-translate keyframe animation), and standard Framer Motion animations.
- **Existing accessibility patterns**: Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `aria-hidden` / `aria-disabled` props, and keyboard action descriptors on buttons and inputs).

## Constraints — do NOT
- Do not use spreadsheet-style tables for chargers or sessions where the
  existing system favors cards — match whatever the existing product
  already does for dense operational data; only introduce a new pattern
  if Phase 0 found nothing suitable, and flag that explicitly when it
  happens.
- Do not use lorem-ipsum placeholders — mock data should look like real
  operational data (plausible SoC %, kW values, timestamps, depot names)
- Do not skip loading/empty/error states on any data view — reuse the
  existing ones from Phase 0.

## Workflow expectations
- For every phase below: first produce an implementation plan (files to
  touch/create, which existing components are reused, data shape) and
  stop for my review before writing code.
- After implementation, use the browser agent to click through the new
  screens and confirm the acceptance criteria for that phase, and
  specifically confirm no other module's UI changed (check the diff).
- Keep mock data and types in one place, extended (not redefined) by
  later phases — following whatever data-layer convention Phase 0 found
  in the existing project.

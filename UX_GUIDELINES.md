# UX/UI Design Guidelines (Curated from UX Collective & Laws of UX)

This document synthesizes core design laws, heuristics, and best practices published on **UX Collective (uxdesign.cc)** and established UX frameworks. Use this checklist as a visual authority and craft standard for all interface development.

---

## 1. The Elegance Formula (UI Design Roadmap)

Based on Taras Bakusevych's framework for beautiful, functional interfaces, organize UI decisions into the following pillars:

### A. Empathy & Audience Alignment

- **Cultural Context:** Color meaning, iconography, and reading direction must match the target demographic.
- **Demographics:** Design touch target sizes and typography for the specific user environment (e.g., larger tap areas for mobile operators on the move).
- **Decisions over Defaults:** Avoid browser defaults; customize visual components to fit the user's specific context.

### B. Layout & Visual Flow

- **Negative Space (Whitespace):** Treat empty space as an active layout element. Whitespace reduces cognitive load and groups related items.
- **Grid Systems:** Align elements on a strict grid (e.g., 4px/8px system). Do not guess margins or padding.
- **Focal Points:** Use scale, contrast, and color to establish a clear hierarchy, directing the user's eye to the primary action first.

### C. Essentialism & Simplification

- **As Little Design as Possible:** If a visual element (borders, shadows, icons) does not serve a functional purpose, remove it.
- **Content is King:** Prioritize readability of data and copy over heavy decoration.
- **Cognitive Load Reduction:** Limit the number of choices and options presented simultaneously.

### D. Guidance & Wayfinding

- **Clear Call to Actions (CTAs):** Use high contrast for primary actions and quieter styles for secondary options.
- **Onboarding & Empty States:** Design empty states to explain _why_ there is no data and _how_ to take the first step.
- **Progressive Disclosure:** Reveal complex information or advanced controls only when the user needs them.

### E. Aesthetics & Emotional Resonance

- **Tone & Voice:** Visual style (typography, colors, radii) must evoke the target brand personality (e.g., premium, trustworthy, technical).
- **Consistent Elevation:** Match shadows, borders, and depth cues to represent a realistic, physically consistent light source.

### F. Novelty vs. Familiarity

- **Aesthetic-Usability Effect:** Users perceive beautiful designs as more usable.
- **Innovate Responsibly:** Introduce new patterns only when they offer a significantly better experience than standard conventions.

### G. Consistency & Trust

- **Predictable Interaction:** Use uniform states (hover, focus, disabled, active) across all buttons, inputs, and tabs.
- **Shared Design Language:** Build interfaces using a single, cohesive token database (colors, type scale, spacing).

---

## 2. Laws of UX (Psychological Principles)

Apply these scientific maxims to structure user flows and cognitive processes:

| Law                    | Explanation                                                                                                    | Actionable Design Application                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Jakob's Law**        | Users spend most of their time on other sites. They expect your site to work the same way.                     | Use standard UI patterns (e.g., search top-right, navigation top/left) unless there is a strong reason to innovate.                 |
| **Fitts's Law**        | The time to acquire a target is a function of the distance to and size of the target.                          | Make primary action buttons large and place them in easily reachable areas. Minimize distance between related interactive elements. |
| **Hick's Law**         | The time it takes to make a decision increases with the number and complexity of choices.                      | Simplify decision-making. Break long forms into multi-step wizards. Group categories cleanly.                                       |
| **Miller's Law**       | The average person can only keep $7 \pm 2$ items in their working memory.                                      | Organize content into small, digestible chunks (chunking) instead of presenting massive tables/lists in one block.                  |
| **Tesler's Law**       | (Conservation of Complexity) For any system, there is an inherent amount of complexity that cannot be reduced. | Shift the burden of complexity from the user to the software (e.g., auto-filling fields, smart defaults).                           |
| **Doherty Threshold**  | System response time should be $< 400\text{ms}$ to keep the user's attention.                                  | Use skeleton screens, progress bars, or micro-animations to make wait times feel shorter or instant.                                |
| **Gestalt Principles** | Humans naturally group individual elements based on proximity, similarity, continuity, and closure.            | Group related inputs or fields inside visual containers or with closer margins to signify association.                              |

---

## 3. Accessibility (WCAG 2.2 Standards)

A design is not complete unless it is usable by everyone:

- **Accessible Contrast:** Ensure text-to-background contrast ratio is at least **4.5:1** for normal text and **3:1** for large text.
- **Keyboard Navigation:** All interactive elements must be reachable via `Tab` and have a highly visible focus indicator.
- **Screen Reader Support:** Use semantic HTML (`<main>`, `<header>`, `<nav>`, `<button>`) and provide descriptive `aria-label` tags for icon-only buttons.
- **Target Size:** Ensure interactive tap targets are at least **$44 \times 44$ CSS pixels** ($48 \times 48\text{px}$ on mobile) with adequate spacing between targets.
- **Accessible Forms:** Never rely on placeholder text alone; always provide persistent labels and clear inline error messages.

---

## 4. Typography & Color Systems

- **Type Hierarchy:** Limit font families to at most two. Establish a clean scale (e.g., Major Third or Perfect Fourth) for headings.
- **Line Length & Height:** Maintain line lengths between **45–75 characters** for body text. Line-height should be **1.5–1.6** for body copy and **1.2–1.3** for headings.
- **Color Strategy (60-30-10 Rule):**
  - **60% dominant hue** (neutral background/canvas).
  - **30% secondary hue** (components, cards, structure).
  - **10% accent color** (interactive actions, highlights, primary CTAs).
- **Dark Mode Contrast:** Avoid pure black backgrounds (`#000000`) for dark mode; use dark grays (`#121212`, oklch values) with reduced-brightness text to prevent eye strain.

---

## 5. Micro-interactions & Motion

- **Purposeful Animation:** Use motion only to guide focus, explain spatial relationships, or provide feedback. Avoid gratuitous, decorative animations.
- **Duration:** Keep UI transitions short and responsive:
  - **Micro-interactions:** $100\text{ms} - 200\text{ms}$
  - **Large transitions (modals/drawers):** $200\text{ms} - 300\text{ms}$
- **Easing:** Avoid linear movement. Use standard ease-in-out (`cubic-bezier(0.4, 0, 0.2, 1)`) for natural, physical behavior.

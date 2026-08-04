---
name: computational-design-thinking
description: Deeply understand and apply computational, algorithmic, parametric, and logic-driven design thinking to create UI, layout systems, design tokens, and data-driven systems.
---

# Computational Design Thinking Skill

This skill guides the AI to operate through the lens of **Computational Design Thinking**—bridging the gap between software engineering logic and visual design excellence. It reframes user interfaces not as static pixel arrangements, but as dynamic, state-driven systems governed by rules, parameters, and algorithms.

## Core Pillars of Computational Design

### 1. Parametric Design & Rules-Based Layouts
*   **Variable-First UI:** Define styles and layouts through parameters (e.g., viewport width, user roles, data density, status values) rather than hardcoded dimensions.
*   **Logical Relationships:** Express elements relative to one another (e.g., padding scale proportional to font size, card radius matching global theme rules).
*   **Responsive Formulas:** Use dynamic scaling rules (like CSS clamp, fluid type scales, and flex/grid ratios) to ensure seamless adaptation across all screen sizes.

### 2. Algorithmic Information Architecture
*   **Data Binding:** Map backend data fields (e.g., risk levels, active counts, metrics) directly to corresponding visual indicators (e.g., HSL hues, progress scales, micro-sparkline strokes).
*   **Truncation & Overflow Logic:** Establish deterministic rules for long strings, nested lists, and empty states. Ensure the UI scales gracefully when mock data is replaced by extreme real-world inputs.
*   **Failsafe Visual States:** Every component must have rules for:
    *   `loading` (skeleton/shimmer animation)
    *   `empty` (informative, action-oriented empty state)
    *   `error` (clear explanation, recovery pathway)

### 3. Modularization & Composability
*   **Atomic Hierarchy:** Deconstruct pages into primitives (buttons, badges, indicators), molecules (form fields, chart legends), organisms (tables, headers), and templates (page shells).
*   **Design Tokens:** Treat color, typography, borders, shadows, and motion as a unified database. Any change in the token database must propagate down automatically.
*   **DRY (Don't Repeat Yourself) UI:** Extend existing primitives and components rather than creating parallel, custom styles.

### 4. Mathematical Precision & Optimization
*   **Consistent Scale:** Maintain visual rhythm using a strict multiplier (e.g., 4px/8px grid system) for margins, padding, line-height, and corner radii.
*   **Contrast & Accessibility (WCAG 2.2):** Ensure color selection, hover states, and keyboard focus rings use mathematically compliant contrast ratios.
*   **Performance Engineering:** Minimize DOM tree depth, optimize SVG complexity, and reduce style recalculations to guarantee high-performance, lag-free interactions.

---

## Design-to-Code Workflow

1.  **Deconstruct the Challenge:** Identify all data inputs, target user tasks, and system constraints.
2.  **Define the Variables:** Establish design tokens (colors, font weights, spacing intervals) and runtime variables (hover states, loading flags, toggle statuses).
3.  **Map Layout Algorithms:** Design using flex containers, grids, and auto-sizing components that self-adjust based on content size.
4.  **Implement Guardrails:** Build in robust checking for edge cases (e.g., extremely long text strings, zero data cases, lack of permissions).
5.  **Verify & Refine:** Audit the interface across multiple resolutions, checking code efficiency, accessibility, and visual authority.

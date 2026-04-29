---
name: QuickLeap
description: Fast, clear, decisive team decision platform
colors:
  primary: "#4fb8b2"
  primary-deep: "#1e5a48"
  primary-light: "#7ed3bf"
  primary-bg: "#4fb8b2"
  sea-ink: "#1e3a35"
  sea-ink-soft: "#4a7068"
  header-bg: "oklch(98% 0.005 175)"
  chip-bg: "oklch(96% 0.008 175)"
  chip-line: "oklch(85% 0.04 175)"
  link-bg-hover: "oklch(92% 0.02 175)"
  line: "oklch(88% 0.02 175)"
  base-100: "oklch(100% 0 0)"
  base-200: "oklch(98% 0 0)"
  base-content: "oklch(21% 0.006 285)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 500
    fontSize: "1.5rem"
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 700
    fontSize: "1.25rem"
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.875rem"
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "1rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "oklch(100% 0 0)"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "oklch(100% 0 0)"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    typography: "{typography.label}"
  button-ghost-hover:
    backgroundColor: "{colors.link-bg-hover}"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.base-100}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    typography: "{typography.body}"
  nav-link:
    textColor: "{colors.sea-ink-soft}"
    rounded: "{rounded.full}"
    padding: "0.375rem 0.75rem"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.sea-ink}"
    backgroundColor: "{colors.chip-bg}"
    rounded: "{rounded.full}"
    padding: "0.375rem 0.75rem"
    typography: "{typography.label}"
---

# Design System: QuickLeap

## 1. Overview

**Creative North Star: "The Quick Ledger"**

QuickLeap's visual system is clean, structured, and fast — like Notion's clarity compressed into decisive action. Information hierarchy guides users toward quick choices without decoration or distraction. The interface is a tool for teams to reach consensus, not a marketing surface. Every pixel earns its place by moving the user closer to a decision.

The system explicitly rejects cluttered enterprise UIs — dense dashboards, tiny text, and overwhelming data presentations that slow down decision-making. There are no neon accents, no glassmorphism, no gradient-text heroes. The design is sharp, minimal, and purpose-driven.

**Key Characteristics:**
- Sea-glass teal primary (oklch 65% 0.15 180) with warm-tinted neutrals
- Fraunces for display headlines, Manrope for UI — serif authority, sans efficiency
- Subtle elevation: flat at rest, gentle lift on interaction
- Decisive by default: no friction, no noise, no dead ends

## 2. Colors: The Sea Glass Palette

Teal-sea primary tones with warm-tinted neutrals. High chroma near 50% lightness, reduced chroma approaching extremes. No pure #000 or #fff — every neutral tints toward the brand teal (chroma 0.005–0.02).

### Primary

- **Sea Glass Teal** (#4fb8b2 / oklch(72% 0.14 178)): Primary actions, buttons, interactive elements. The color of decisive action.
- **Deep Teal** (#1e5a48 / oklch(35% 0.08 160)): Text emphasis, borders, high-contrast details.
- **Light Teal** (#7ed3bf / oklch(78% 0.12 175)): Gradient accents, selection highlights, hover states.

### Neutral

- **Sea Ink** (#1e3a35 / oklch(30% 0.05 180)): Primary text color — body copy, headings, critical labels.
- **Sea Ink Soft** (#4a7068 / oklch(45% 0.04 175)): Secondary text — captions, footnotes, inactive states.
- **Header Background** (oklch(98% 0.005 175)): Sticky header surface with subtle teal tint.
- **Chip Background** (oklch(96% 0.008 175)): Badges, tags, inline elements.
- **Chip Line** (oklch(85% 0.04 175)): Borders for chips and inline containers.
- **Link Hover Background** (oklch(92% 0.02 175)): Hover state for navigation and links.
- **Line** (oklch(88% 0.02 175)): Dividers, borders, structural lines.

### Named Rules

**The Decisive Accent Rule.** The primary teal carries no more than 15% of any given surface. Its rarity creates visual hierarchy — when you see teal, action is required.

**The Warm Neutral Rule.** Every neutral tints toward the brand teal (chroma 0.005–0.02). Pure gray is forbidden — #000 and #fff never appear.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Manrope (with system-ui, sans-serif fallback)

**Character:** Fraunces brings editorial authority to headlines — a serif with presence. Manrope delivers UI efficiency — humanist sans, highly legible at small sizes. The pairing creates structured clarity: Fraunces for "what", Manrope for "how".

### Hierarchy

- **Display** (700, clamp(2rem, 5vw, 3.5rem), 1.1): Hero headlines, page titles. Fraunces 700 for maximum impact.
- **Headline** (500, 1.5rem, 1.3): Section headers, card titles. Fraunces 500 — authoritative but not overwhelming.
- **Title** (700, 1.25rem, 1.4): Component titles, modal headers. Manrope 700 for UI clarity.
- **Body** (400, 1rem, 1.6): Default body text. Manrope 400, capped at 70ch for readability.
- **Label** (600, 0.875rem, 1.4, 0.01em letter-spacing): Buttons, nav items, form labels. Manrope 600 for UI weight.

### Named Rules

**The Hierarchy Rule.** Scale ratio ≥1.25 between steps. Flat scales are forbidden — if two text elements look the same size, one is wrong.

**The Line Length Rule.** Body text never exceeds 70ch. The reading experience is structured, not endless.

## 4. Elevation

QuickLeap uses subtle tonal layering with gentle shadows on interaction. Surfaces are flat at rest — shadows appear only as a response to state (hover, active, focus). The shadow vocabulary is minimal: `shadow-sm` for cards at rest, `hover:-translate-y-0.5` with `shadow-md` for interaction.

### Shadow Vocabulary

- **Ambient Low** (`0 8px 24px rgba(30,90,72,0.08)`): Card rest state, chip elements. Diffuse teal-tinted shadow.
- **Ambient Medium** (`0 8px 22px rgba(30,90,72,0.12)`): Hover states, interactive elements.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus).

**The Teal Tint Rule.** All shadows carry the brand hue (rgba(30,90,72,...)). Neutral shadows (gray) are forbidden.

## 5. Components

### Buttons

- **Shape:** Rounded corners (0.5rem / md)
- **Primary:** Sea Glass Teal background, white text, Manrope 600, padding 0.5rem 1.5rem
- **Hover / Focus:** Deep Teal background, slight upward translation (-0.5px), smooth transition
- **Ghost:** Transparent background, Sea Ink text, hover shows Link Hover Background
- **Disabled:** Reduced opacity (0.5), no hover response

### Cards

- **Corner Style:** Rounded (1rem / lg)
- **Background:** Base-100 (near white with teal tint)
- **Shadow Strategy:** `shadow-sm` at rest, lift on hover per Elevation rules
- **Border:** None — depth through shadow, not lines
- **Internal Padding:** 1.5rem (lg) for standard cards

### Inputs / Fields

- **Style:** Transparent background, Sea Ink text, md radius, Manrope body
- **Focus:** Primary teal outline or border shift, no heavy glow
- **Error:** Red-tinted border (destructive role from daisyUI), error text
- **Disabled:** Muted background, reduced contrast

### Navigation

- **Nav Link:** Sea Ink Soft text, full-rounded pill shape, Manrope 600, padding 0.375rem 0.75rem
- **Active State:** Chip Background with Sea Ink text — pill-shaped active indicator
- **Hover:** Link Hover Background, smooth color transition
- **Mobile:** Responsive wrapping, full-width on small screens

### Chips / Tags

- **Style:** Chip Background, Sea Ink text, full-rounded, border in Chip Line
- **State:** Selected uses Primary teal background with white text

## 6. Do's and Don'ts

### Do:

- **Do** use Sea Glass Teal sparingly — its rarity creates visual hierarchy.
- **Do** tint every neutral toward the brand teal (chroma 0.005–0.02).
- **Do** maintain ≥1.25 scale ratio between typography steps.
- **Do** cap body line length at 70ch for readability.
- **Do** keep surfaces flat at rest; add shadows only on interaction.
- **Do** use Fraunces for "what" (headlines), Manrope for "how" (UI elements).

### Don't:

- **Don't** use side-stripe borders (`border-left` greater than 1px) as colored accents. Use background tints or full borders.
- **Don't** use gradient text (`background-clip: text`). Use a single solid color for emphasis.
- **Don't** use glassmorphism as decoration. Shadows are subtle and purposeful, or nothing.
- **Don't** create identical card grids with icon + heading + text repeated endlessly. Vary the layout.
- **Don't** use modals as a first thought. Exhaust inline / progressive alternatives first.
- **Don't** create cluttered enterprise UIs — dense dashboards, tiny text, overwhelming data that slows decision-making.
- **Don't** use `#000` or `#fff`. Every neutral tints toward brand teal.
- **Don't** use em dashes — use commas, colons, semicolons, periods, or parentheses.
- **Don't** let AI slop happen — if someone can guess "it looks like a voting app" from category alone, rework the scene and color strategy.

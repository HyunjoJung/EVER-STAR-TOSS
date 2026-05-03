# Design System

EVER-STAR uses Toss Design System components first, then adds a small app layer for domain-specific layout and color. This keeps the app aligned with Apps in Toss while avoiding one-off styling in every screen.

## Foundation

App tokens live in `src/design/tokens.ts`.

- `colors`: white surfaces, Toss-like gray text, a restrained coral brand accent, success, and borders
- `spacing`: 4/8/12/16/20/24/36 scale
- `radius`: 8px default corners, 10px utility corners, pill radius for progress and chips
- `lineHeights`: compact caption, normal body, readable long-form text
- `layout`: screen padding, footer padding, and card gaps

## Components

Shared primitives live in `src/components`.

- `Screen`: full-screen layout with scroll content, optional header, and fixed footer
- `Card`: repeated content surface with title, description, optional right accessory, and press state
- `Pill`: status chip for identity, quest type, and completion state
- `FormField`: labeled input with consistent text color, border, radius, and multiline sizing
- `EmptyState`: quiet empty/error-adjacent state for missing pets or records

## Direction

The app should feel closer to a quiet Toss utility than a marketing page. Use cards only for individual repeated or framed items. Keep screens dense enough for repeated use, and keep emotional copy inside the workflow rather than adding large explanatory sections.

New screens should import tokens instead of hardcoding hex colors, border radius, or screen spacing. If a TDS component already covers a control, use TDS before creating a custom primitive.

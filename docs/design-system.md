# Design System

EVER-STAR uses Toss Design System components first, then adds a small app layer for domain-specific layout and color. This keeps the app aligned with Apps in Toss while preserving the original EVER-STAR design language where it still fits a miniapp.

The original web app had an atomic design system under `everStarFrontend/src/components` plus `everStarFrontend/DESIGN_TOKENS.md`. The RN app does not copy those React/Tailwind components directly because they depend on DOM, Tailwind classes, hover states, and web SVG patterns. Instead, the migration keeps the tokens and component intent, then re-expresses them with TDS and React Native primitives.

## Foundation

App tokens live in `src/design/tokens.ts`.

- `colors`: white surfaces, Toss-like gray text, a restrained coral brand accent, success, and borders
- `spacing`: 4/8/12/16/20/24/36 scale
- `radius`: 8px default corners, 10px utility corners, pill radius for progress and chips
- `lineHeights`: compact caption, normal body, readable long-form text
- `layout`: screen padding, footer padding, and card gaps

Original token mappings:

| Original web token | RN app token | Value |
| --- | --- | --- |
| `--mainprimary` | `colors.brand` / `colors.legacyMainPrimary` | `#ff9078` |
| `--mainprimary-text` | `colors.brandText` / `colors.legacyMainPrimaryText` | `#f28c76` |
| `--mainsecondary` | `colors.textPrimary` / `colors.legacyMainSecondary` | `#1f2329` |
| `--bgorange` | `colors.brandSoft` / `colors.legacyBackgroundOrange` | `#fdede8` |
| `--bggrey` | `colors.surfaceMuted` / `colors.legacyBackgroundGrey` | `#f3f6fb` |
| `--greyscaleblack-20` | `colors.legacyGrey20` | `#f0f2f6` |
| `--greyscaleblack-40` | `colors.legacyGrey40` | `#dbe5ec` |
| `--greyscaleblack-60` | `colors.legacyGrey60` | `#c3c9d3` |
| `--greyscaleblack-80` | `colors.textTertiary` / `colors.legacyGrey80` | `#8d939d` |
| `--greyscaleblack-100` | `colors.textPrimary` / `colors.legacyGrey100` | `#1f2329` |

## Components

Shared primitives live in `src/components`.

- `BrandScene`: mobile hero scene using the generated sky garden asset
- `ArtworkPanel`: illustrated feature panel for letter and memorial book surfaces
- `Screen`: full-screen layout with scroll content, optional header, and fixed footer
- `Card`: repeated content surface with title, description, optional right accessory, and press state
- `Pill`: status chip for identity, quest type, and completion state
- `FormField`: labeled input with consistent text color, border, radius, and multiline sizing
- `EmptyState`: quiet empty/error-adjacent state for missing pets or records

Generated illustration assets live in `assets/illustrations`.

- `ever-star-sky-garden.png`: home hero background
- `ever-star-letterbox.png`: letters and empty states
- `ever-star-memorial-book.png`: memorial book and empty states

Legacy component mappings:

| Original component | RN migration |
| --- | --- |
| `PrimaryButton` | Prefer TDS `Button`; keep legacy focus/white/hover intent through primary vs `style="weak"` usage |
| `Card`, `CardHeader`, `CardBody`, `CardFooter` | `components/Card`, with repeated-item framing only |
| `Badge`, `StatusBadge` | `Pill`, limited to simple status labels |
| `ProgressBar` | Home progress track; original rainbow milestone colors are deferred because v1 uses quieter Toss-style progress |
| `LetterCard` | Letter list/detail compositions using `Card` and `Txt` |
| `FormGroup`, `Textbox`, `Select` | `FormField` plus future TDS controls when picker/date controls are added |
| `LogoIcons` / star logo assets | `assets/brand/ever-star-logo.svg` and `ever-star-logo-600.png` |

Do not migrate web-only components tied to excluded v1 features: OpenVidu, chat, cheering/community, random exploration, and FCM/SSE surfaces.

## Direction

The app should feel closer to a quiet Toss utility than a marketing page. Use cards only for individual repeated or framed items. Keep screens dense enough for repeated use, and keep emotional copy inside the workflow rather than adding large explanatory sections.

New screens should import tokens instead of hardcoding hex colors, border radius, or screen spacing. If a TDS component already covers a control, use TDS before creating a custom primitive.

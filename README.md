# Lekhochitro — গ্রাফ ক্যালকুলেটর

A beautiful, fast, web-based graphing calculator. Plot mathematical functions, explore graphs with pan & zoom, and share your creations.

🌐 **Live:** [lekhochitro.pages.dev](https://lekhochitro.pages.dev)

![Lekhochitro](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Function Plotting** — Type any mathematical expression and see it plotted instantly
- **Interactive Canvas** — Pan by dragging, zoom with scroll wheel (centered on cursor)
- **Multi-touch Support** — Pinch-to-zoom and drag on mobile devices
- **Multiple Functions** — Plot multiple expressions simultaneously with color coding
- **Rich Math Support** — `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `abs`, `pi`, `e`, `^`, and more
- **Crosshair** — Mouse position crosshair with real-time coordinate display
- **Zoom Controls** — Zoom in/out, reset view, fit to screen
- **Responsive** — Desktop sidebar layout, mobile bottom panel
- **Dark Theme** — Desmos-inspired dark UI with Bengali branding
- **Bengali + English** — Bengali label: "গ্রাফ ক্যালকুলেটর"
- **No Server** — Static export, runs entirely in the browser
- **CI/CD** — GitHub Actions: lint → type check → unit tests → build → E2E tests → deploy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Static Export) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Math Engine | mathjs |
| Graph Rendering | HTML5 Canvas API (custom) |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions |
| Deployment | Cloudflare Pages |
| Icons | Lucide React |

## Quick Start

```bash
# Clone
git clone https://github.com/nhprince/lekhochitro.git
cd lekhochitro

# Install
pnpm install

# Dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test              # Unit tests
pnpm test:coverage     # Unit tests with coverage
pnpm test:e2e          # E2E tests (requires build)
pnpm test:all          # Type check + lint + tests + build
```

## Supported Math Expressions

| Expression | Description |
|-----------|-------------|
| `x^2` | Power |
| `sin(x)`, `cos(x)`, `tan(x)` | Trigonometric |
| `asin(x)`, `acos(x)`, `atan(x)` | Inverse trigonometric |
| `log(x)` | Natural logarithm |
| `log10(x)` | Base-10 logarithm |
| `sqrt(x)` | Square root |
| `abs(x)` | Absolute value |
| `floor(x)`, `ceil(x)`, `round(x)` | Rounding |
| `pi`, `e` | Constants |
| `sin(x^2) + cos(x)` | Nested expressions |

## Project Structure

```
lekhochitro/
├── app/
│   ├── globals.css        # Tailwind + theme variables
│   ├── layout.tsx         # Root layout + metadata
│   └── page.tsx           # Main page (GraphCalculator)
├── components/
│   ├── Graph/
│   │   └── index.tsx      # Canvas renderer (pan, zoom, draw)
│   ├── FunctionList/
│   │   └── index.tsx      # Function input list UI
│   └── Controls/
│       └── index.tsx      # Zoom/reset buttons
├── lib/
│   ├── math.ts            # mathjs wrapper + safe evaluation
│   ├── math.test.ts       # Unit tests for math
│   ├── graph-utils.ts     # Coordinate transforms, point generation
│   └── graph-utils.test.ts # Unit tests for graph utils
├── e2e/
│   └── app.spec.ts        # Playwright E2E tests
├── .github/workflows/
│   └── ci-cd.yml          # CI/CD pipeline
├── playwright.config.ts   # Playwright config
├── vitest.config.ts       # Vitest config
└── next.config.ts         # Next.js config (static export)
```

## CI/CD Pipeline

Every push and PR runs:

1. **🔍 Lint & Type Check** — ESLint + TypeScript strict
2. **🧪 Unit Tests** — 35 tests (math parser, graph utils)
3. **🏗️ Build** — Static export
4. **🎭 E2E Tests** — Playwright (page load, interactions, responsive)
5. **🚀 Deploy** — Cloudflare Pages (main branch only)
6. **💡 Lighthouse** — Performance audit (main branch only)

## License

MIT © NH Prince Pradhan

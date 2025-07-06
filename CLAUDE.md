# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Astro Nano is a minimal, lightweight, static blog and portfolio theme built with Astro, Tailwind CSS, and TypeScript. It's designed to be a more minimal version of Astro Sphere with focus on performance, accessibility, and SEO.

This was originally an Astro template project that I am using as a basis for building my personal site at www.rudyadams.com

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at localhost:4321 |
| `npm run dev:network` | Start dev server accessible on local network |
| `npm run build` | Build production site (includes astro check) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |

## Architecture

### Content Collections
The site uses Astro's content collections system with three main collections defined in `src/content/config.ts`:

- **blog**: Blog posts with title, description, date, and optional draft status
- **work**: Work experience entries with company, role, dateStart, and dateEnd
- **projects**: Project entries with title, description, date, optional draft status, and optional demo/repo URLs

### Key Configuration Files
- `src/consts.ts`: Site configuration, metadata, and social links
- `src/types.ts`: TypeScript type definitions for Site, Metadata, and Socials
- `astro.config.mjs`: Astro configuration with MDX, sitemap, and Tailwind integrations
- `tailwind.config.mjs`: Tailwind configuration with dark mode and typography plugin

### Styling System
- Uses Tailwind CSS with custom fonts (Inter for sans-serif, Lora for serif)
- Dark mode support via CSS classes
- Utility function `cn()` in `src/lib/utils.ts` combines clsx and tailwind-merge
- Custom CSS animations and transitions

### Core Components
- `PageLayout.astro`: Main layout wrapper with Head, Header, and Footer
- `ArrowCard.astro`: Card component for blog posts and projects
- `Container.astro`: Content container with responsive sizing
- `Link.astro`: Enhanced link component with external link handling

### Utility Functions (`src/lib/utils.ts`)
- `formatDate()`: Formats dates using Intl.DateTimeFormat
- `readingTime()`: Calculates reading time from HTML content
- `dateRange()`: Formats date ranges for work experience

### Path Aliases
Uses `@*` aliases pointing to `./src/*` for cleaner imports throughout the codebase.

## Content Structure
- Blog posts: `src/content/blog/*/index.md`
- Projects: `src/content/projects/*/index.md`
- Work experience: `src/content/work/*.md`
- Static assets: `public/` directory

## Build Process
The build command runs `astro check` (TypeScript checking) before building, ensuring type safety in production builds.
# Rudy Adams Personal Site

Personal portfolio and technical blog for Rudy Adams. The site is built with Astro, Tailwind CSS, MDX support, RSS, sitemap generation, and a Netlify deployment target.

The current visual direction is a subtle evolution of the original Astro Nano theme: technical, sharp, mostly monochrome, with a restrained blue accent and light/dark theme support.

## Project Structure

```text
src/
  components/   Reusable Astro UI components
  content/      Blog, project, and work entries
  layouts/      Shared page layouts
  lib/          Utility functions
  pages/        Astro routes, RSS, and robots.txt
  styles/       Global Tailwind and theme styles
public/         Static assets, fonts, favicons, and images
```

Content schemas live in `src/content/config.ts`. Update that file before adding new frontmatter fields.

## Local Development

Run all commands from the repository root.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Astro dev server at `localhost:4321` |
| `npm run build` | Run Astro checks and build the production site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Apply safe ESLint fixes |

## Content Editing

Blog posts and projects use folder-based slugs:

```text
src/content/blog/<slug>/index.md
src/content/projects/<slug>/index.md
```

Blog and project frontmatter requires `title`, `description`, and `date`; `draft` is optional. Projects may also include `demoURL` and `repoURL`.

Work entries live in `src/content/work/*.md` and require `company`, `role`, `dateStart`, and `dateEnd`.

## Styling

Global styling is defined in `src/styles/global.css`. The theme uses CSS variables for colors, local Mona Sans fonts from `public/fonts`, and SVG favicons in `public/favicon-light.svg` and `public/favicon-dark.svg`.

Keep future styling changes aligned with the current direction: crisp spacing, restrained surfaces, strong typography, and minimal but deliberate personality.

## Deployment

Netlify builds the site with `npm run build` and publishes `dist/`. The production site URL is configured in `astro.config.mjs` as `https://www.rudyadams.com`.

## Verification

For documentation-only changes, run:

```bash
git diff --check
```

For code, content, styling, or navigation changes, run:

```bash
npm run lint
npm run build
```

When visual behavior changes, also smoke test the site in a browser or with Playwright: open the home page, navigate to blog, open one post, and verify light/dark theme behavior.

## Contributor Notes

See `AGENTS.md` for detailed repository conventions, content patterns, and browser verification notes.
